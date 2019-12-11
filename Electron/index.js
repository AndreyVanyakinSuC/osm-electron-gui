const { app, ipcMain, Menu, dialog, BrowserWindow } = require('electron');
// Emitter
const notifier = require('./notifier');
//
const _ = require('lodash');
const log = require('electron-log');
const path = require('path');
const {
  CONNECTWINDOW__CREATE,
  CONNECTWINDOW__CLOSE,
  CONNECTWINDOW__SETTINGS,
  SOURCE__CONNECT,
  SOURCE__DISCONNECT,
  ELECTRON_HISTORYREQ,
  MAINWINDOW__HISTORYRES,
  MAINWINDOW__HISTORYERR,
  MAINWINDOW_CLEARIDB,
  ELECTRON__HISTORYCLEARED,
  ELECTRON__CLEARERR
} = require('./IPC');
const { PING_NOT_OK, PING_OK, CONNECTING } = require('./events');

const { installReactDEvTools } = require('./base');
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
log.transports.file.clear()
log.transports.file.maxSize = 5242880;
log.transports.file.file = path.resolve('./') + '/osm-gui.log';
// log.transports.file.fileName = 'osm-gui.log';
log.transports.file.init()

log.variables.label = 'ECN';
log.transports.console.format =
  '[{y}-{d}-{m} {h}:{i}:{s}.{ms}] [{label}] [{level}] {text}';
log.transports.file.format =
  '[{y}-{d}-{m} {h}:{i}:{s}.{ms}] [{label}] [{level}] {text}';


log.info(log.transports.file.findLogPath());


// Keep a reference for dev mode
// let dev = true;
dev = process.env.NODE_ENV === 'dev' ? true : false;
// log.silly(dev);



app.on('ready', () => {
  
  installReactDEvTools();

  //
  // HANDLE MAIN WINDOW
  //

  // Both windows are created at startup but connect is not displayed until request

  mainWindow = createMainWindow(dev);
  //   Enable custom menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  mainWindow.on('show', () => {
    log.silly('[MainWindow] _on show_');

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
    log.silly('[IPC] _on CONNECTWINDOW__CREATE_');
    enableConnectWindow();
  });

  // USER WANTS TO CLOSE CONNECT WINDOW
  ipcMain.on(CONNECTWINDOW__CLOSE, () => {
    log.silly('[IPC] _on CONNECTWINDOW__CLOSE_');
    connectWindow.close();
  });

  // CONNECT WINDOW SENT CONNECT SETTINGS AND IS WISHING TO CONNECT
  ipcMain.on(SOURCE__CONNECT, (e, settings) => {
    log.silly('[IPC] _on SOURCE__CONNECT_');

    // MAMANGE SETTINGS PERSISTENCE
    writeSettings(settings);

    // CONNECT
    connect();
  });

  // USER INDUCED DISCONNECT
  ipcMain.on(SOURCE__DISCONNECT, () => {
    log.silly('[IPC] _on SOURCE__DISCONNECT_');
    disconnect();
  });

  // MAIN RENDERER SENT A HISTORY REQUEST
  ipcMain.on(ELECTRON_HISTORYREQ, (e,request) => {
    log.silly('[IPC] _on ELECTRON_HISTORYREQ_');

    // REQUEST HISTORY AND RESPONSE WITH EITHER DATA OR ERROR
    const historyUrl = new URL(esUrl());
    historyUrl.pathname = 'history'

    // log.info(historyUrl.href);


    return reqHistory(historyUrl.href, request)
      .then(res => {log.info('[AXIOS] Incoming history');
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

  // MAIN RENDERER HAS CLEAREAD HISTORY IN DA IDB
  ipcMain.on(ELECTRON__HISTORYCLEARED, () => {
    dialog.showMessageBox({
      type: "info",
      title:"Хранилище успешно очищено",
    })
  })

  // MAIN RENDERER HAS CLEAREAD HISTORY IN DA IDB
  ipcMain.on(ELECTRON__CLEARERR, (err) => {
    dialog.showErrorBox(
      'Не удалось очистить хранилище',
      `${err}`
    );
  })

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

// app.on('', () => {

// });

// CONNECT WINDOW ROUTINE
const enableConnectWindow = () => {
  connectWindow = createConnectWindow(mainWindow, dev);
  connectWindow.on('show', () => {
    log.silly('[connectWindow] _on show_');

    // SEND SETTINGS TO CONNECTWINDOW
    connectWindow.webContents.send(CONNECTWINDOW__SETTINGS, readSettings());

    // SEND CURRENT STATUS TO CONNECTWINDOW
    const status = connectStatusIPC();
    status !== null ? connectWindow.webContents.send(status) : null;
  });

  connectWindow.on('close', () => {
    log.silly('[connectWindow] _on close_');
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
    label: 'Хранилище',
    submenu: [{
      label: 'Очистить',
      async click() {
        const result = await dialog.showMessageBox({
          type: "question",
          buttons: ["Очистить","Отмена"],
          cancelId:1,
          title:"Подтверждение очистки",
          detail: "Вы уверены, что хотите удалить результаты измерений, полученные ранее от сервера?"
        })

        if (result.response === 0) {
          log.info('[MENU] User wants to clear the storage')
          mainWindow.webContents.send(MAINWINDOW_CLEARIDB);

        }
      }
    }]
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
            message: 'Клиент ОСМ ВЛ',
            detail: 'Разработано АО "Союзтехэнерго". Телефон +7 (495) 644-40-46. E-mail: ste@ste.su'
          });
        }
      }
      // {
      //   label: 'Сообщить об ошибке',
      //   click() {
      //     console.log('[MENU] Сообщить об ошибке was сlicked');
      //   }
      // }
    ]
  },
  {
    label: 'Разработчик',
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
