import React, { Component } from 'react';
import { CONNECTWINDOW__CREATE, ELECTRON_HISTORYREQ } from '../Electron/IPC';
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
      console.log(
        '%c[H] Server returned an empty arr => no history for the requested timespans'
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
        console.log('%c[H] No new history was written to db');
      } else {
        this.setState({ historyPKs: PKs });
        console.log(`%c[H] Have just written ${PKs.length} slices to database`);
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
        console.log('Using available schema from db');
        this.fillStateWithSchema(res);
      } else {
        console.log('No schema in db available');
      }
    });

    // connection handlers
    ipcRenderer.on('connection:connecting..', () => {
      console.log('%c[IPC] connection:connecting..', 'color: darkgreen');
      this.setState(() => ({ isConnecting: true }));
    });

    ipcRenderer.on('connection:established', (e, url) => {
      const serverIP = _.split(url, '/')[2];
      console.log('%c[IPC]connection:established', 'color: darkgreen');
      this.setState(() => ({
        isConnected: true,
        isConnecting: false,
        ip: serverIP
      }));
    });

    ipcRenderer.on('connection:closed', () => {
      console.log('%c[IPC] connection:closed', 'color: darkgreen');
      this.setState(() => ({ isConnected: false }));
    });

    ipcRenderer.on('connection:error', () => {
      console.log('%c[IPC] connection:error', 'color: darkgreen');

      this.setState(prevState => {
        if (prevState.isConnecting) {
          return { isConnected: false, isConnecting: false };
        } else {
          return null;
        }
      });
    });

    ipcRenderer.on('schema:new', (e, schemaJson) => {
      console.log('%c[IPC] schema:new', 'color: darkgreen');

      if (this.state.isSchemaAvailable) {
        // compare schemas, if same schema => not update it, else cl
        this.setState(prevState => {
          const isSameSchema = compareSchemas(
            JSON.stringify(prevState.schema),
            schemaJson
          );

          if (isSameSchema) {
            console.log('Incoming schema is the same thats already in state');
            return null;
          } else {
            console.log(
              'Some schema was available but the received one is different, applyong it'
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

        writeSchemaToDB(schemaJson).then(() => {
          this.fillStateWithSchema(schemaJson);
        });
      }
    });

    ipcRenderer.on('fresh:new', (e, freshJson) => {
      const verified = verifyData(freshJson);
      console.log('%c[IPC] fresh:new', 'color: darkgreen');

      writeDataToDB(verified)
        // will only update state if some new fresh was actually written to db
        .then(PKs => {
          // if some fresh were written - update the last fresh message TS in state
          this.setState({ lastFreshMessageTS: nowTS() });

          // feed state with fresh data
          PKs !== null ? this.fillStateWithFresh(PKs) : null;
        });
    });

    ipcRenderer.on('history:request-fired', () =>
      console.log('%c[IPC] history:request-fired', 'color: darkgreen')
    );

    ipcRenderer.on('history:new', (e, historyJson) => {
      console.log('%c[IPC] history:new', 'color: darkgreen');
      // stop waiting in state
      this.setState({ isWaitingHistory: false });

      this.parseHistory(historyJson);
    });

    ipcRenderer.on('history:request-failed', (e, err) => {
      console.log('%c[IPC] history:request-failed', 'color: darkgreen', err);

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
      console.log(
        '%c[h] The formed request was empty, i.e. no need to fetch data'
      );
      return null;
    }

    // if (isWaitingHistory) {
    //   console.log('[H] Request was prepared, but already expecting history');
    //   return null;
    // }

    await ipcRenderer.send('history:new-request', request);

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
