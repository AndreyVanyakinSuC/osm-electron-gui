const { app, ipcMain } = require('electron');
const _ = require('lodash');
const log = require('electron-log');
const {
  CONNECTWINDOW__CREATE,
  CONNECTWINDOW__CLOSE,
  CONNECTWINDOW__SETTINGS,
  SOURCE__CONNECT,
  SOURCE__DISCONNECT,
  ELECTRON_HISTORYREQ,
  MAINWINDOW__HISTORYRES,
  MAINWINDOW__HISTORYERR
} = require('./IPC');

const { dev, installReactDEvTools } = require('./base');
const { writeSettings, readSettings } = require('./settings.js');
const reqHistory = require('./history.js');
const { es, connect, disconnect } = require('./source');
const { createMainWindow } = require('./MainWindow.js');
const { createConnectWindow } = require('./ConnectWindow');

let windows = [];
let mainWindow, connectWindow;

//
// LOGGER
//
log.variables.label = 'ECN';
log.transports.console.format =
  '[{y}-{d}-{m} {h}:{i}:{s}.{ms}] [{label}] [{level}] {text}';
log.transports.file.format =
  '[{y}-{d}-{m} {h}:{i}:{s}.{ms}] [{label}] [{level}] {text}';
log.transports.file.maxSize = 5242880;
log.info(log.transports.file.findLogPath());

app.on('ready', () => {
  log.info('App _on ready_');
  installReactDEvTools();

  //
  // HANDLE MAIN WINDOW
  //

  // Both windows are created at startup but connect is not displayed until request

  mainWindow = createMainWindow();

  mainWindow.on('show', () => {
    log.info('[MainWindow] _on show_');
    windows.push(mainWindow);

    // Autoconenct if set to true and has settings
    if (readSettings() !== undefined && readSettings().isAutoconnect) {
      connect();
    }
  });

  //
  // INCOMING IPC
  //

  // USER WANTS TO OPEN CONNECT WINDOW
  ipcMain.on(CONNECTWINDOW__CREATE, () => {
    log.info('[IPC] _on CONNECTWINDOW__CREATE_');
    connectWindow = createConnectWindow();
    windows.push(connectWindow);

    connectWindow.on('show', () => {
      log.info('[connectWindow] _on show_');

      // SEND SETTINGS TO CONNECTWINDOW
      connectWindow.webContents.send(CONNECTWINDOW__SETTINGS, readSettings());
    });

    connectWindow.on('close', () => {
      log.info('[connectWindow] _on close_');
      windows = _.without(windows, connectWindow);
    });
  });

  // USER WANTS TO CLOSE CONNECT WINDOW
  ipcMain.on(CONNECTWINDOW__CLOSE, () => {
    log.info('[IPC] _on CONNECTWINDOW__CLOSE_');
    connectWindow.close();
  });

  // CONNECT WINDOW SENT CONNECT SETTINGS AND IS WISHING TO CONNECT
  ipcMain.on(SOURCE__CONNECT, (e, settings) => {
    log.info('[IPC] _on SOURCE__CONNECT_');

    // MAMANGE SETTINGS PERSISTENCE
    writeSettings(settings);

    // CONNECT
    connect();
  });

  // USER INDUCED DISCONNECT
  ipcMain.on(SOURCE__DISCONNECT, () => {
    log.info('[IPC] _on SOURCE__DISCONNECT_');
    disconnect();
  });

  // MAIN RENDERER SENT A HISTORY REQUEST
  ipcMain.on(ELECTRON_HISTORYREQ, () => {
    log.info('[IPC] _on ELECTRON_HISTORYREQ_');

    // REQUEST HISTORY AND RESPONSE WITH EITHER DATA OR ERROR
    return reqHistory()
      .then(res => {
        log.info('[AXIOS] Incoming history', res);
        mainWindow.webContents.send(
          MAINWINDOW__HISTORYRES,
          JSON.stringify(res.data)
        );
      })
      .catch(err => {
        log.error('[AXIOS] Error requesting history', err);
        mainWindow.webContents.send(MAINWINDOW__HISTORYERR, err);
      });
  });
});
