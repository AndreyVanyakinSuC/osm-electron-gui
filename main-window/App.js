import React, { Component } from 'react';
import log from 'electron-log';
const url = require('url');
log.variables.label = 'MW';
import {
  CONNECTWINDOW__CREATE,
  SOURCE__ISDISCONNECTED,
  SOURCE__ISCONNECTING,
  SOURCE__ISCONNECTED,
  MAINWINDOW__SCHEMA,
  MAINWINDOW__FRESH,
  ELECTRON_HISTORYREQ,
  MAINWINDOW__HISTORYRES,
  MAINWINDOW__HISTORYRES
} from '../Electron/IPC';
import { ipcRenderer } from 'electron';
import { TREND_HRS, HISTORY_SPAN_SECS } from './APInHelpers/base';
import {
  writeSchemaToDB,
  compareSchemas,
  readSchemaFromDB,
  writeDataToDB,
  readByPKs,
  outObjIDs,
  readDataByTSRanges,
  freshestPKs
} from './APInHelpers/database';
import {
  maxTS,
  minusHrs,
  nowTS,
  addTrends,
  displayHuman
} from './APInHelpers/timeseries';
import { prepareHistoryRequest, checkHistory } from './APInHelpers/history';
import { verifySchema, verifyData } from './APInHelpers/verification';
import { worstCaseRibbon } from './APInHelpers/notification';
import { schemaObjIDs } from './APInHelpers/schema';
//FIXME:
// import moment from 'moment';

import './styles/app.scss';
import Header from './components/Header/Header';
import Fresh from './components/Fresh/Fresh';
import History from './components/History/History';
import Fallback from './components/Fallback';

class App extends Component {
  state = {
    isConnected: false, // is the connection to Source ON
    isConnecting: false, // is connecting
    ip: '', // server ip string
    isWaitingHistory: false, // some data request was sent to server and neither error nor result have returned
    isSchemaAvailable: false, // app has some schema
    mode: 'fresh', // 'history / 'fresh'
    schema: {}, // schema
    //fresh
    fresh: {},
    lastFreshMessageTS: '', // timestamp of moment of last fresh message arrival
    isFreshAvailable: false, //if fresh is available to show
    // history
    historyPKs: [],
    lastHistoryRequest: {} // used to compare as well
    //
  };

  parseHistory(historyJson) {
    // Server has no history for the requested timespans i.e. return an empty [arr]
    const isEmpty = JSON.parse(historyJson).length === 0;

    if (isEmpty) {
      log.info(
        '[History] Server returned an empty arr => no history for the requested timespans'
      );
      return;
    }

    // 1) verify
    const verifiedHistory = verifyData(historyJson);

    // 2) Count how many records received of the requested
    const history = checkHistory(
      this.state.lastHistoryRequest,
      verifiedHistory
    );

    // 3) Write to db and clear the last history request
    writeDataToDB(history).then(PKs => {
      if (PKs === null) {
        log.info('[History] No new history was written to dbs');
      } else {
        this.setState({ historyPKs: PKs });
        log.info(
          `[History] Have just written ${PKs.length} slices to database`
        );
      }
    });
  }

  fillStateWithSchema(schemaJson) {
    const schema = verifySchema(schemaJson);

    // put schema to state
    this.setState(() => ({
      isSchemaAvailable: true,
      schema: schema
    }));
  }

  fillStateWithFresh(freshPKs, trendHours = TREND_HRS) {
    //

    // console.log('fresh PKs',freshPKs);
    // read records for written fresh
    readByPKs(freshPKs)
      // res = [{data},{} .. {}]
      .then(dataArr => {
        // console.log('Successfull read', dataArr);

        const objIDs = outObjIDs(dataArr); // define object ids
        const endTS = maxTS(dataArr);
        // console.log(`[F] Freshest ts = ${displayHuman(endTS)}`,'color: brown');
        const startTS = minusHrs(endTS, trendHours);
        const trendRange = [startTS, endTS];

        // console.log(`trend range = ${trendRange}, object ids = ${objIDs}`);

        // read data for trends
        readDataByTSRanges(objIDs, trendRange).then(trendMaterial => {
          // dataArr
          const fresh = addTrends(dataArr, trendMaterial); // Calculate trends and add properties
          // console.log('Befroe grouping', freshArr);
          this.setState(prevState => {
            // add new fresh objects, keep existing and not updated unchanged
            const mergedFresh = _.merge(prevState.fresh, fresh);

            if (prevState.isFreshAvailable) {
              return { fresh: mergedFresh };
            } else {
              return { fresh: mergedFresh, isFreshAvailable: true }; // first time
            }
          });
          // console.log('[APP] New fresh in state');

          //
        });
      });
  }

  //Fetch data
  componentDidMount() {
    // console.log('Component did mount');

    // Preload schema if avaialabel
    // returns undefined if no schema available
    readSchemaFromDB().then(res => {
      if (res !== undefined) {
        log.info('[Schema] Preloading schema from db');
        this.fillStateWithSchema(res);
      } else {
        log.info('[Schema] No schema available in db');
      }
    });

    // connection handlers
    ipcRenderer.on(SOURCE__ISCONNECTING, () => {
      log.info('[IPC] Received _SOURCE__ISCONNECTING_');
      this.setState(() => ({ isConnecting: true }));
    });

    ipcRenderer.on(SOURCE__ISCONNECTED, (e, url) => {
      const serverURL = new URL(url);
      log.info('[IPC] Received _SOURCE__ISCONNECTED');
      this.setState(() => ({
        isConnected: true,
        isConnecting: false,
        ip: serverURL.hostname
      }));
    });

    ipcRenderer.on(SOURCE__ISDISCONNECTED, () => {
      log.info('[IPC] Received SOURCE__ISDISCONNECTED');
      this.setState(() => ({ isConnected: false }));
    });

    // ipcRenderer.on('connection:error', () => {
    //   console.log('%c[IPC] connection:error', 'color: darkgreen');

    //   this.setState(prevState => {
    //     if (prevState.isConnecting) {
    //       return { isConnected: false, isConnecting: false };
    //     } else {
    //       return null;
    //     }
    //   });
    // });

    ipcRenderer.on(MAINWINDOW__SCHEMA, (e, schemaJson) => {
      log.info('[IPC] Received MAINWINDOW__SCHEMA');

      if (this.state.isSchemaAvailable) {
        log.info('[Schema] Some schema was available');
        // compare schemas, if same schema => not update it, else cl
        this.setState(prevState => {
          const isSameSchema = compareSchemas(
            JSON.stringify(prevState.schema),
            schemaJson
          );

          if (isSameSchema) {
            log.info(
              '[Schema] Incoming schema is the same thats already in state, will not update state'
            );
            return null;
          } else {
            log.info(
              '[Schema] New schema is different, will use it instead of old'
            );
            writeSchemaToDB(schemaJson).then(() => {
              this.fillStateWithSchema(schemaJson);
            });
          }
        });
      } else {
        // write schema to idb
        // set schame availability flag ON
        // put schema obj to state
        log.info(
          '[Schema] No schema was in state, applying the newly received schema'
        );
        writeSchemaToDB(schemaJson).then(() => {
          this.fillStateWithSchema(schemaJson);
        });
      }
    });

    ipcRenderer.on(MAINWINDOW__FRESH, (e, freshJson) => {
      log.info('[IPC] Received MAINWINDOW__FRESH');
      const verified = verifyData(freshJson);

      writeDataToDB(verified)
        // will only update state if some new fresh was actually written to db
        .then(PKs => {
          // if some fresh were written - update the last fresh message TS in state
          this.setState({ lastFreshMessageTS: nowTS() });

          // feed state with fresh data
          PKs !== null ? this.fillStateWithFresh(PKs) : null;
        });
    });

    // ipcRenderer.on('history:request-fired', () =>
    //   console.log('%c[IPC] history:request-fired', 'color: darkgreen')
    // );

    ipcRenderer.on(MAINWINDOW__HISTORYRES, (e, historyJson) => {
      log.info('[IPC] _MAINWINDOW__HISTORYRES_ new history received');
      // stop waiting in state
      this.setState({ isWaitingHistory: false });

      this.parseHistory(historyJson);
    });

    ipcRenderer.on(MAINWINDOW__HISTORYERR, e => {
      log.info('[IPC] MAINWINDOW__HISTORYERR history request failed');

      // stop waiting in state
      this.setState({ isWaitingHistory: false });
    });
  }

  //
  // Will send 'history:new-request' to Main if [request]  is not empty i.e => something is missing

  async handleHistoryRequest(needMin, needMax, objIDs, spanSecs) {
    // const needMin = moment().subtract(2, 'days').unix();
    // const needMax = moment().subtract(0, 'days').unix();
    // const objIDs = [4013,4014];
    // const spanSecs = 600;

    const request = await prepareHistoryRequest(
      needMin,
      needMax,
      objIDs,
      spanSecs
    );

    const isEmptyRequest = request.length === 0;

    // FIXME: Disabling one request at a time
    // const isWaitingHistory = this.state.isWaitingHistory;

    if (isEmptyRequest) {
      log.info(
        '[History] The formed request was empty, i.e. no need to fetch data from server'
      );
      return null;
    }

    // if (isWaitingHistory) {
    //   console.log('[H] Request was prepared, but already expecting history');
    //   return null;
    // }

    await ipcRenderer.send(ELECTRON_HISTORYREQ, request);

    this.setState({
      isWaitingHistory: true,
      lastHistoryRequest: request
    });
    // console.log(`%c[IPC] History request sent to main`,'color: darkgreen',request);
  }

  // handle current <=> history switch mode = string 'history / 'fresh'
  handleAppModeSwitch(mode) {
    this.setState(prevState => {
      if (prevState.mode === mode) {
        return null;
      } else {
        return { mode: mode };
      }
    });
  }

  // handle hsitory mode click
  handleHistoryModeClick() {
    this.setState(() => {
      return { mode: 'history' };
    });
  }

  // handle connect click in falback
  handleConnectClick() {
    ipcRenderer.send(CONNECTWINDOW__CREATE);
  }

  render() {
    const isCanShowFresh =
      this.state.isSchemaAvailable && this.state.isFreshAvailable;
    const isCanShowHistory = this.state.isSchemaAvailable;

    let display;

    switch (this.state.mode) {
      case 'fresh': {
        if (this.state.isConnected && isCanShowFresh) {
          display = (
            <Fresh
              schema={this.state.schema}
              fresh={this.state.fresh}
              historyPKs={this.state.historyPKs}
              onHistoryRequired={this.handleHistoryRequest.bind(this)}
            />
          );
        } else {
          display = (
            <Fallback
              mode="fresh"
              isConnected={this.state.isConnected}
              isConnecting={this.state.isConnecting}
              onConnectClick={this.handleConnectClick.bind(this)}
              onHistoryModeClick={this.handleHistoryModeClick.bind(this)}
              isSchemaAvailable={this.state.isSchemaAvailable}
            />
          );
        }

        break;
      }

      case 'history': {
        if (this.state.isSchemaAvailable) {
          display = (
            <History
              schema={this.state.schema}
              isConnected={this.state.isConnected}
              onHistoryRequired={this.handleHistoryRequest.bind(this)}
              historyPKs={this.state.historyPKs}
            />
          );
        } else {
          display = (
            <Fallback
              mode="history"
              isConnected={this.state.isConnected}
              isConnecting={this.state.isConnecting}
              onConnectClick={this.handleConnectClick.bind(this)}
              onHistoryModeClick={this.handleHistoryModeClick.bind(this)}
              isSchemaAvailable={this.state.isSchemaAvailable}
            />
          );
        }

        break;
      }
    }

    return (
      <div className="App">
        <Header
          ip={this.state.ip}
          lastFreshMessageTS={this.state.lastFreshMessageTS}
          onConnectClick={this.handleConnectClick.bind(this)}
          isConnected={this.state.isConnected}
          isConnecting={this.state.isConnecting}
          isWaitingHistory={this.state.isWaitingHistory}
          isSchemaAvailable={this.state.isSchemaAvailable}
          isFreshAvailable={this.state.isFreshAvailable}
          isCanShowFresh={isCanShowFresh}
          isCanShowHistory={isCanShowHistory}
          ribbonData={
            isCanShowFresh
              ? worstCaseRibbon(this.state.fresh)
              : { value: null, msgCode: null }
          }
          onModeChange={this.handleAppModeSwitch.bind(this)}
          mode={this.state.mode}
        />

        <div className="main">{display}</div>
      </div>
    );
  }
}

export default App;
