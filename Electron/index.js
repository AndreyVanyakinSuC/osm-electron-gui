const { app, ipcMain, Menu, dialog, BrowserWindow } = require('electron');
// Emitter
const notifier = require('./notifier');
//
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
const { PING_NOT_OK, PING_OK, CONNECTING } = require('./events');

const { dev, installReactDEvTools } = require('./base');
const { writeSettings, readSettings } = require('./settings.js');
const reqHistory = require('./history.js');
const { connectStatusIPC, connect, disconnect, esUrl } = require('./source');
const { createMainWindow } = require('./MainWindow.js');
const { createConnectWindow } = require('./ConnectWindow');

// let windows = [];
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
  //   Enable custom menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  mainWindow.on('show', () => {
    log.info('[MainWindow] _on show_');

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
    enableConnectWindow();
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
  ipcMain.on(ELECTRON_HISTORYREQ, request => {
    log.info('[IPC] _on ELECTRON_HISTORYREQ_');

    // REQUEST HISTORY AND RESPONSE WITH EITHER DATA OR ERROR
    const historyUrl = new URL(esUrl());

    return reqHistory(historyUrl.href, request)
      .then(res => {
        log.info('[AXIOS] Incoming history', res);
        mainWindow.webContents.send(
          MAINWINDOW__HISTORYRES,
          JSON.stringify(res.data)
        );
      })
      .catch(err => {
        log.error('[AXIOS] Error requesting history', err);
        mainWindow.webContents.send(MAINWINDOW__HISTORYERR);
      });
  });

  //
  // EVENTS
  //

  // FAILED TO PING SERVER WHEN CONNECTING
  notifier.on(PING_NOT_OK, host => {
    dialog.showErrorBox(
      'Ошибка подключения',
      `Не удалось пропинговать ${host}, проверьте правильность введенных данных.`
    );
  });
});

// CONNECT WINDOW ROUTINE
const enableConnectWindow = () => {
  connectWindow = createConnectWindow(mainWindow);
  connectWindow.on('show', () => {
    log.info('[connectWindow] _on show_');

    // SEND SETTINGS TO CONNECTWINDOW
    connectWindow.webContents.send(CONNECTWINDOW__SETTINGS, readSettings());

    // SEND CURRENT STATUS TO CONNECTWINDOW
    const status = connectStatusIPC();
    status !== null ? connectWindow.webContents.send(status) : null;
  });

  connectWindow.on('close', () => {
    log.info('[connectWindow] _on close_');
  });
};

// MENU
const menuTemplate = [
  {
    label: 'Файл',
    submenu: [
      {
        label: 'Соединение..',
        click() {
          enableConnectWindow();
        }
      },
      {
        label: 'Выйти',
        accelerator: 'Alt+Q',
        click() {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Окно',
    submenu: [
      {
        label: 'Свернуть',
        accelerator: 'Ctrl+M',
        click() {
          mainWindow.minimize();
        }
      }
    ]
  },
  {
    label: 'Помощь',
    submenu: [
      {
        label: 'О программе..',
        accelerator: 'F1',
        click() {
          dialog.showMessageBox({
            title: 'О программе',
            type: 'info',
            message: 'Программа ОСМ ВЛ версия 1',
            detail: 'Очень очень хорощий программа'
          });
        }
      },
      {
        label: 'Сообщить об ошибке',
        click() {
          console.log('[MENU] Сообщить об ошибке was сlicked');
        }
      }
    ]
  },
  {
    label: 'Debug',
    submenu: [
      {
        label: 'DevTools',
        accelerator: 'Ctrl+Shift+I',
        click() {
          mainWindow.webContents.openDevTools();
        }
      },
      {
        label: 'Refresh',
        accelerator: 'F5',
        click() {
          mainWindow.reload();
        }
      }
    ]
  }
];
