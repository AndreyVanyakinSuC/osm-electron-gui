const { app, ipcMain, Menu, dialog } = require('electron');
app.commandLine.appendSwitch('ignore-certificate-errors', 'true');
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
// Emitter
const notifier = require('./notifier');
const electronLocalshortcut = require('electron-localshortcut');
//
const _ = require('lodash');
const log = require('electron-log');
const path = require('path');
const {
  CONNECTWINDOW__CREATE,
  CONNECTWINDOW__CLOSE,
  CONNECTWINDOW__SETTINGS,
  SWINDOW_SEND,
  SWINDOW_RECEIVE,
  SWINDOW_DEF_REQ,
  SWINDOW_DEF_RES,
  SWINDOW_CLOSE,
  ADVWINDOW_CLOSE,
  ADVWINDOW_SEND,
  ADVWINDOW_RECEIVE,
  ADVWINDOW_DEF_REQ,
  SOURCE__CONNECT,
  SOURCE__DISCONNECT,
  ELECTRON_HISTORYREQ,
  MAINWINDOW_MAPSETTINGS,
  MAINWINDOW_ADVSETTINGS,
  MAINWINDOW__HISTORYRES,
  MAINWINDOW__HISTORYERR,
  MAINWINDOW_CLEARIDB,
  ELECTRON__HISTORYCLEARED,
  ELECTRON__CLEARERR
} = require('./IPC');
const { PING_NOT_OK, PING_OK, CONNECTING } = require('./events');

const {
  writeSettings,
  readSettings,
  setAdvancedDefaults,
  setMapDefaults,
  hasSettings,
  initDefaults
} = require('./settings.js');
const reqHistory = require('./history.js');
const {
  connectStatusIPC,
  connect,
  disconnect,
  reconnect,
  esUrl
} = require('./source');
const { createMainWindow } = require('./MainWindow.js');
const { createConnectWindow } = require('./ConnectWindow');
const { createMapSettingsWindow } = require('./MapSettingsWindow');
const { createAdvancedWindow } = require('./AdvancedWindow');
// const image = require('./_icon/green_icon.png');

// let windows = [];
let mainWindow, connectWindow, mapSettingsWindow, advancedWindow;

//
// LOGGER
//
// log.transports.file.clear();
log.transports.file.maxSize = 5242880;
log.transports.file.file = path.resolve('./') + '/Лог.log';
log.transports.file.init();
log.variables.label = 'ECN';

log.transports.console.format =
  '[{y}-{d}-{m} {h}:{i}:{s}.{ms}] [{label}] [{level}] {text}';
log.transports.file.format =
  '[{y}-{d}-{m} {h}:{i}:{s}.{ms}] [{label}] [{level}] {text}';

log.info(log.transports.file.findLogPath());

// Keep a reference for dev mode

dev = process.env.NODE_ENV === 'development' ? true : false;
// console.log('process.env.NODE_ENV', process.env.NODE_ENV);

// Set `__static` path to static files in production
// if (!dev) {
//   global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\');
// }

const DEFAULT_SETTINGS = initDefaults(dev);

app.on('ready', () => {
  // CHECK IF DEFAULT SETTINGS ARE SET
  if (!hasSettings('advanced')) {
    setAdvancedDefaults(DEFAULT_SETTINGS.advanced);
  }
  if (!hasSettings('settings')) {
    setMapDefaults(DEFAULT_SETTINGS.settings);
  }

  // HANDLE MAIN WINDOW
  //

  // Both windows are created at startup but connect is not displayed until request

  mainWindow = createMainWindow(dev);
  //   Enable custom menu
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  electronLocalshortcut.register(mainWindow, 'Ctrl+Shift+I', () =>
    mainWindow.webContents.openDevTools()
  );

  electronLocalshortcut.register(mainWindow, 'Alt+A', () =>
    enableAdvancedWindow()
  );

  mainWindow.once('ready-to-show', () => {
    //  SEND STORED SETTINGS TO UI ON STARTUP
    const { primary, secondary } = readSettings('settings');
    mainWindow.webContents.send(MAINWINDOW_MAPSETTINGS, { primary, secondary });
    const advanced = readSettings('advanced');
    mainWindow.webContents.send(MAINWINDOW_ADVSETTINGS, advanced);
    mainWindow.show();
    // setIconOverlay();
  });

  mainWindow.on('show', () => {
    log.silly('[MainWindow] _on show_');
    // Autoconenct if set to true and has settings
    if (
      readSettings('connectSettings') !== undefined &&
      readSettings('connectSettings').isAutoconnect
    ) {
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

  // USER WANTS TO CLOSE SETTINGS WINDOW
  ipcMain.on(SWINDOW_CLOSE, () => {
    log.silly('[IPC] _on SWINDOW_CLOSE_');
    mapSettingsWindow.close();
  });

  // RECEIVING SETTINGS FROM MAP SETTINGS WINDOW
  ipcMain.on(SWINDOW_SEND, (e, args) => {
    log.silly('[IPC] _on SWINDOW_SEND_');
    console.log('SWINDOW_SEND', args);
    writeSettings('settings', args);
    const { primary, secondary, proxy } = readSettings('settings');
    mainWindow.webContents.send(MAINWINDOW_MAPSETTINGS, {
      primary,
      secondary,
      proxy
    });
  });

  // RECEIVING DEFAULTS REQUEST FROM MAP SETTINGS  WINDOW
  ipcMain.on(SWINDOW_DEF_REQ, () => {
    log.silly('[IPC] _on SWINDOW_DEF_REQ_');
    mapSettingsWindow.webContents.send(
      SWINDOW_DEF_RES,
      DEFAULT_SETTINGS.settings
    );
  });

  // USER WANTS TO CLOSE ADVANCED SETTINGS WINDOW
  ipcMain.on(ADVWINDOW_CLOSE, () => {
    log.silly('[IPC] _on ADVWINDOW_CLOSE_');
    advancedWindow.close();
  });

  // RECEIVING SETTINGS FROM ADVANCED SETTINGS WINDOW
  ipcMain.on(ADVWINDOW_SEND, (e, args) => {
    log.silly('[IPC] _on ADVWINDOW_SEND_');
    writeSettings('advanced', args);
    const {
      isAddMsgToFresh,
      freshMaxPtsCount,
      trendHrs,
      trensMaxPtsCount,
      historyShowHrs,
      historyMaxPtsCount,
      historySpanSecs
    } = readSettings('advanced');
    mainWindow.webContents.send(MAINWINDOW_ADVSETTINGS, {
      isAddMsgToFresh,
      freshMaxPtsCount,
      trendHrs,
      trensMaxPtsCount,
      historyShowHrs,
      historyMaxPtsCount,
      historySpanSecs
    });
  });

  // ADV WINDOW REQUESTS DEFAULTS
  ipcMain.on(ADVWINDOW_DEF_REQ, () => {
    log.silly('[IPC] _on ADVWINDOW_DEF_REQ_');
    advancedWindow.webContents.send(
      ADVWINDOW_RECEIVE,
      DEFAULT_SETTINGS.advanced
    );
  });
  // CONNECT WINDOW SENT CONNECT SETTINGS AND IS WISHING TO CONNECT
  ipcMain.on(SOURCE__CONNECT, (e, args) => {
    log.silly('[IPC] _on SOURCE__CONNECT_');
    // MAMANGE SETTINGS PERSISTENCE
    writeSettings('connectSettings', args);

    // CONNECT
    connect();
  });

  // USER INDUCED DISCONNECT
  ipcMain.on(SOURCE__DISCONNECT, () => {
    log.silly('[IPC] _on SOURCE__DISCONNECT_');
    disconnect();
  });

  // MAIN RENDERER SENT A HISTORY REQUEST
  ipcMain.on(ELECTRON_HISTORYREQ, (e, request) => {
    log.silly('[IPC] _on ELECTRON_HISTORYREQ_');

    // REQUEST HISTORY AND RESPONSE WITH EITHER DATA OR ERROR
    const historyUrl = new URL(esUrl());
    historyUrl.pathname = 'history';

    return reqHistory(historyUrl.href, request)
      .then(res => {
        log.silly('[AXIOS] Incoming history');
        // log.info('response',res);
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
      type: 'info',
      title: 'Хранилище успешно очищено'
    });
  });

  // MAIN RENDERER HAS CLEAREAD HISTORY IN DA IDB
  ipcMain.on(ELECTRON__CLEARERR, err => {
    dialog.showErrorBox('Не удалось очистить хранилище', `${err}`);
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

app.on('login', (event, webContents, request, authInfo, callback) => {
  log.silly('Login event fired', request);
  // console.log('Login event fired', request);
  if (!!readSettings('settings') && !!readSettings('settings').proxy) {
    const { domain_user, password } = readSettings('settings').proxy;
    callback(domain_user, password);
  }
});

// app.on('', () => {

// });

// CONNECT WINDOW ROUTINE
const enableConnectWindow = () => {
  connectWindow = createConnectWindow(mainWindow, dev);
  connectWindow.on('show', () => {
    log.silly('[connectWindow] _on show_');

    // SEND SETTINGS TO CONNECTWINDOW
    connectWindow.webContents.send(
      CONNECTWINDOW__SETTINGS,
      readSettings('connectSettings')
    );

    // SEND CURRENT STATUS TO CONNECTWINDOW
    const status = connectStatusIPC();
    status !== null ? connectWindow.webContents.send(status) : null;
  });

  connectWindow.on('close', () => {
    log.silly('[connectWindow] _on close_');
  });
};

// MAP SETTINGS WINDOW ROUTINE
const enableMapSettingsWindow = () => {
  mapSettingsWindow = createMapSettingsWindow(mainWindow, dev);
  mapSettingsWindow.on('show', () => {
    log.silly('[mapSettingsWindow] _on show_');

    // SEND DATA TO SETTINGS WINDOW
    mapSettingsWindow.webContents.send(
      SWINDOW_RECEIVE,
      readSettings('settings')
    );
  });
  mapSettingsWindow.on('close', () => {
    log.silly('[mapSettingsWindow] _on close_');
  });
};

// ADVANCED SETTINGS WINDOW ROUTINE
const enableAdvancedWindow = () => {
  advancedWindow = createAdvancedWindow(mainWindow, dev);
  advancedWindow.on('show', () => {
    log.silly('[advancedWindow] _on show_');

    // SEND DATA TO ADV SETTINGS WINDOW
    advancedWindow.webContents.send(
      ADVWINDOW_RECEIVE,
      readSettings('advanced')
    );
  });
  advancedWindow.on('close', () => {
    log.silly('[advancedWindow] _on close_');
  });
};

// Set icon overlay
const setOverlayIcon = color => {
  mainWindow.setOverlayIcon(image);
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
    submenu: [
      {
        label: 'Очистить',
        async click() {
          const result = await dialog.showMessageBox({
            type: 'question',
            buttons: ['Очистить', 'Отмена'],
            cancelId: 1,
            title: 'Подтверждение очистки',
            detail:
              'Вы уверены, что хотите удалить результаты измерений, полученные ранее от сервера?'
          });

          if (result.response === 0) {
            log.silly('[MENU] User wants to clear the storage');
            mainWindow.webContents.send(MAINWINDOW_CLEARIDB);
          }
        }
      }
    ]
  },
  {
    label: 'Настройки',
    click() {
      enableMapSettingsWindow();
    }
  },
  // {
  //   label: 'Advanced',
  //   click() {
  //     enableAdvancedWindow();
  //   }
  // },
  {
    label: 'О программе',
    accelerator: 'F1',
    click() {
      dialog.showMessageBox({
        title: 'О программе',
        type: 'info',
        message: 'Клиент ОСМ ВЛ',
        detail:
          'Версия 2020-12a. Разработано АО "Союзтехэнерго". Телефон +7 (495) 644-40-46. E-mail: ste@ste.su'
      });
    }
    // {
    //   label: 'Сообщить об ошибке',
    //   click() {
    //     console.log('[MENU] Сообщить об ошибке was сlicked');
    //   }
    // }
  }
  // {
  //   label: 'Разработчик',
  //   submenu: [
  //     {
  //       label: 'Средства разработчика',
  //       accelerator: 'Ctrl+Shift+I',
  //       click() {
  //         mainWindow.webContents.openDevTools();
  //       }
  //     }
  //     // {
  //     //   label: 'Refresh',
  //     //   accelerator: 'F5',
  //     //   click() {
  //     //     mainWindow.reload();
  //     //   }
  //     // }
  //   ]
  // }
];
