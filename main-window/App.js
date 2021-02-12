import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import { initLogger } from '../Electron/logger';
initLogger(log, 'MainW');
const crypto = require('crypto');
const url = require('url');

import {
  CONNECTWINDOW__CREATE,
  SOURCE__ISDISCONNECTED,
  SOURCE__ISCONNECTING,
  SOURCE__ISCONNECTED,
  MAINWINDOW__SCHEMA,
  MAINWINDOW__FRESH,
  ELECTRON_HISTORYREQ,
  MAINWINDOW_MAPSETTINGS,
  MAINWINDOW_ADVSETTINGS,
  MAINWINDOW__HISTORYRES,
  MAINWINDOW__HISTORYERR,
  MAINWINDOW_CLEARIDB,
  ELECTRON__HISTORYCLEARED,
  ELECTRON__CLEARERR,
  MAINWINDOW_SIGNALSETTINGS,
  ELECTRON_SIGNALSETTINGS
} from '../Electron/IPC';

import {
  writeSchemaToDB,
  compareSchemas,
  readSchemaFromDB,
  writeDataToDB,
  readByPKs,
  outObjIDs,
  readDataByTSRanges,
  clearDataDB,
  deleteDB,
  declareDB,
  freshestPKs
} from './APInHelpers/database';
import {
  maxTS,
  minusHrs,
  nowTS,
  addTrends,
  displayHuman
} from './APInHelpers/timeseries';
import {
  prepareHistoryRequest,
  prepareSimpleHistoryRequest,
  checkHistory,
  addMsgs
} from './APInHelpers/history';
import { verifySchema, verifyData } from './APInHelpers/verification';
import { worstCaseRibbon } from './APInHelpers/notification';
import { freshDummy } from './APInHelpers/schema';
import { formatFresh, F_MODES, I_MODE } from './APInHelpers/history';
//FIXME:
// import moment from 'moment';

import './styles/app.scss';
import SettingsContext from './components/SettingsContext';
import Header from './components/Header/Header';
import Fresh from './components/Fresh/Fresh';
import History from './components/History/History';
import Fallback from './components/Fallback';
import Settings from './components/Settings/Settings';

// ### LOGGING INIT ###
// log.variables.label = 'MW';
// log.transports.file.file = path.resolve('./') + '/osm-gui.log';
// log.transports.file.init();

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
    iceMode: I_MODE.kg_per_m,
    fMode: F_MODES.kgs,
    spanLength: 200,
    isSoundAlarmOption: true,
    soundIceThreshold: 3, // mm
    fresh: {},
    lastFreshMessageTS: '', // timestamp of moment of last fresh message arrival
    isFreshAvailable: false, //if fresh is available to show
    // history
    historyPKs: [],
    isShowModal: false,
    lastHistoryRequest: {} // used to compare as well
    //
  };

  parseHistory(historyJson) {
    // Server has no history for the requested timespans i.e. return an empty [arr]
    const isEmpty = historyJson.length === 0;

    if (isEmpty) {
      log.silly(
        '[History] Server returned an empty arr => no history for the requested timespans'
      );
      return;
    }

    // 1) verify
    // Add messages only if flag set
    let verifiedHistory;

    if (this.state.advanced.isAddMsgToFresh) {
      verifiedHistory = addMsgs(verifyData(historyJson));
    } else {
      verifiedHistory = verifyData(historyJson);
    }

    // 2) Count how many records received of the requested
    // const history = checkHistory(
    //   this.state.lastHistoryRequest,
    //   verifiedHistory
    // );

    // 3) Write to db and clear the last history request
    writeDataToDB(verifiedHistory).then(() => {
      this.setState({ historyPKs: crypto.randomBytes(16) });
      // if (PKs === null) {
      //   log.silly('[History] No new history was written to dbs');
      // } else {
      //   this.setState({ historyPKs: PKs });
      //   log.silly(
      //     `[History] Have just written ${PKs.length} slices to database`
      //   );
      // }
    });
  }

  fillStateWithSchema(schemaJson) {
    const schema = verifySchema(schemaJson);

    // put schema to state
    //  put empty fresh if fresh was not available to enable show of map and interface withour data
    this.setState(prevState => {
      if (prevState.isFreshAvailable === false) {
        return {
          isSchemaAvailable: true,
          schema: schema,
          isFreshAvailable: true,
          fresh: freshDummy(schema)
        };
      } else {
        return {
          isSchemaAvailable: true,
          schema: schema
        };
      }
    });

    // console.log(this.state.fresh)
  }

  fillStateWithFresh(freshPKs, trendHours = this.state.advanced.trendHrs) {
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

          const fresh = addTrends(
            dataArr,
            trendMaterial,
            this.state.advanced.trensMaxPtsCount
          ); // Calculate trends and add properties
          // console.log('Befroe grouping', freshArr);
          this.setState(prevState => {
            // add new fresh objects, keep existing and not updated unchanged
            const mergedFresh = formatFresh(
              _.merge(prevState.fresh, fresh),
              this.state.spanLength,
              this.state.fMode,
              this.state.iceMode
            );

            console.log('mergerFresh', mergedFresh);

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
        log.silly('[Schema] Preloading schema from db');
        this.fillStateWithSchema(res);
      } else {
        log.silly('[Schema] No schema available in db');
      }
    });

    ipcRenderer.on(MAINWINDOW_SIGNALSETTINGS, (e, data) => {
      const {
        fMode,
        iceMode,
        isSoundAlarmOption,
        soundIceThreshold,
        spanLength
      } = data;
      this.setState(() => ({
        fMode,
        iceMode,
        isSoundAlarmOption,
        soundIceThreshold,
        spanLength
      }));
    });

    // connection handlers
    ipcRenderer.on(SOURCE__ISCONNECTING, (e, url) => {
      const serverURL = new URL(url);
      log.silly('[IPC] Received _SOURCE__ISCONNECTING_');
      this.setState(() => ({
        isConnecting: true,
        isConnected: false,
        ip: serverURL.hostname
      }));
    });

    ipcRenderer.on(SOURCE__ISCONNECTED, (e, url) => {
      const serverURL = new URL(url);
      log.silly('[IPC] Received _SOURCE__ISCONNECTED');
      this.setState(() => ({
        isConnected: true,
        isConnecting: false,
        ip: serverURL.hostname
      }));
    });

    ipcRenderer.on(SOURCE__ISDISCONNECTED, () => {
      log.silly('[IPC] Received SOURCE__ISDISCONNECTED');
      this.setState(() => ({ isConnected: false, isConnecting: false }));
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

    ipcRenderer.on(MAINWINDOW_MAPSETTINGS, (e, tileSources) => {
      console.log('tileSources', tileSources);
      this.setState(() => ({
        tileSources: tileSources
      }));
      // console.log(this.state);
    });

    ipcRenderer.on(MAINWINDOW_ADVSETTINGS, (e, advanced) => {
      console.log('advanced', advanced);
      this.setState(() => ({
        advanced: advanced
      }));
      console.log(this.state);
    });

    ipcRenderer.on(MAINWINDOW__SCHEMA, (e, schemaJson) => {
      log.silly('[IPC] Received MAINWINDOW__SCHEMA');
      log.info(schemaJson);

      if (this.state.isSchemaAvailable) {
        log.silly('[Schema] Some schema was available');
        // compare schemas, if same schema => not update it, else cl
        this.setState(prevState => {
          const isSameSchema = compareSchemas(
            JSON.stringify(prevState.schema),
            schemaJson
          );

          if (isSameSchema) {
            log.silly(
              '[Schema] Incoming schema is the same thats already in state, will not update state'
            );
            return null;
          } else {
            log.silly(
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
        log.silly(
          '[Schema] No schema was in state, applying the newly received schema'
        );
        writeSchemaToDB(schemaJson).then(() => {
          this.fillStateWithSchema(schemaJson);
        });
      }
    });

    ipcRenderer.on(MAINWINDOW__FRESH, (e, freshJson) => {
      log.silly('[IPC] Received MAINWINDOW__FRESH');

      // Add messages only if required
      let verified;

      if (this.state.advanced.isAddMsgToFresh) {
        verified = addMsgs(verifyData(freshJson));
      } else {
        verified = verifyData(freshJson);
      }

      writeDataToDB(verified)
        // will only update state if some new fresh was actually written to db
        .then(PKs => {
          // if some fresh were written - update the last fresh message TS in state
          this.setState({ lastFreshMessageTS: nowTS() });

          // feed state with fresh data
          PKs !== null ? this.fillStateWithFresh(PKs) : null;
        });
    });

    // Clear history on user request
    ipcRenderer.on(MAINWINDOW_CLEARIDB, async () => {
      try {
        log.silly('[IPC] Received MAINWINDOW_CLEARIDB');
        await deleteDB();
        await declareDB();
        this.setState({
          isWaitingHistory: false,
          historyPKs: crypto.randomBytes(16)
        });
        ipcRenderer.send(ELECTRON__HISTORYCLEARED);
      } catch (error) {
        log.error(error);
        ipcRenderer.send(ELECTRON__CLEARERR, err);
      }
    });

    // ipcRenderer.on('history:request-fired', () =>
    //   console.log('%c[IPC] history:request-fired', 'color: darkgreen')
    // );

    ipcRenderer.on(MAINWINDOW__HISTORYRES, (e, historyJSON) => {
      log.silly(
        '[IPC] _MAINWINDOW__HISTORYRES_ new history received by main window'
      );
      // stop waiting in state
      this.setState({ isWaitingHistory: false });

      // Parse it
      this.parseHistory(historyJSON);
    });

    ipcRenderer.on(MAINWINDOW__HISTORYERR, e => {
      log.silly('[IPC] MAINWINDOW__HISTORYERR history request failed');

      // stop waiting in state
      this.setState({
        isWaitingHistory: false,
        historyPKs: crypto.randomBytes(16)
      });
    });
  }

  //
  // Will send 'history:new-request' to Main if [request]  is not empty i.e => something is missing

  async handleHistoryRequest(needMin, needMax, objIDs, spanSecs) {
    // const needMin = moment().subtract(2, 'days').unix();
    // const needMax = moment().subtract(0, 'days').unix();
    // const objIDs = [4013,4014];
    // const spanSecs = 600;

    // #### TESTING SIMPLE HISTORY REQUEST ####
    const request = await prepareSimpleHistoryRequest(
      needMin,
      needMax,
      objIDs,
      spanSecs
    );
    // const request = await prepareHistoryRequest(
    //   needMin,
    //   needMax,
    //   objIDs,
    //   spanSecs
    // );

    const isEmptyRequest = request.length === 0;

    // FIXME: Disabling one request at a time
    // const isWaitingHistory = this.state.isWaitingHistory;

    if (isEmptyRequest) {
      log.silly(
        '[History] The formed request was empty, i.e. no need to fetch data from server'
      );
      return null;
    }

    // if (isWaitingHistory) {
    //   console.log('[H] Request was prepared, but already expecting history');
    //   return null;
    // }
    // console.log(request)
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

  handleSettingsClick() {
    this.setState(ps => ({ isShowModal: true }));
  }

  handleCloseSettings() {
    this.setState(ps => ({ isShowModal: false }));
  }

  handleApplySettings(s) {
    const {
      iceMode,
      fMode,
      spanLength,
      isSoundAlarmOption,
      soundIceThreshold
    } = s;
    ipcRenderer.send(ELECTRON_SIGNALSETTINGS, s);
    this.setState(ps => ({
      iceMode,
      fMode,
      spanLength,
      isSoundAlarmOption,
      soundIceThreshold
    }));
    this.handleCloseSettings();
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
              spanLength={this.state.spanLength}
              fMode={this.state.fMode}
              iceMode={this.state.iceMode}
              fresh={this.state.fresh}
              tileSources={this.state.tileSources}
              historyPKs={this.state.historyPKs}
              onHistoryRequired={this.handleHistoryRequest.bind(this)}
              freshMaxPtsCount={this.state.advanced.freshMaxPtsCount}
              trendHrs={this.state.advanced.trendHrs}
              trensMaxPtsCount={this.state.advanced.trensMaxPtsCount}
              historySpanSecs={this.state.advanced.historySpanSecs}
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
              spanLength={this.state.spanLength}
              fMode={this.state.fMode}
              iceMode={this.state.iceMode}
              isConnected={this.state.isConnected}
              onHistoryRequired={this.handleHistoryRequest.bind(this)}
              historyPKs={this.state.historyPKs}
              historyShowHrs={this.state.advanced.historyShowHrs}
              historyMaxPtsCount={this.state.advanced.historyMaxPtsCount}
              historySpanSecs={this.state.advanced.historySpanSecs}
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
      <SettingsContext.Provider
        value={{
          iceMode: this.state.iceMode,
          fMode: this.state.fMode,
          spanLength: this.state.spanLength
        }}
      >
        <div className="App">
          <Header
            ip={this.state.ip}
            isSoundAlarmOption={this.state.isSoundAlarmOption}
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
            onSettingsClick={this.handleSettingsClick.bind(this)}
            soundIceThreshold={this.state.soundIceThreshold}
          />
          {this.state.isShowModal && (
            <Settings
              isOpen={this.state.isShowModal}
              onClose={this.handleCloseSettings.bind(this)}
              onApply={this.handleApplySettings.bind(this)}
              iceMode={this.state.iceMode}
              fMode={this.state.fMode}
              spanLength={this.state.spanLength}
              soundIceThreshold={this.state.soundIceThreshold}
              isSoundAlarmOption={this.state.isSoundAlarmOption}
            />
          )}
          <div className="main">{display}</div>
        </div>
      </SettingsContext.Provider>
    );
  }
}

export default App;
