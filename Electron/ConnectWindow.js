const { BrowserWindow } = require('electron');
const { winIndexpath } = require('./base');
const log = require('electron-log');
const path = require('path');

const createConnectWindow = function(mainWindow, dev) {
  log.info('[ConnectWindow] Creating..');

  const connectWindow = new BrowserWindow({
    parent: mainWindow,
    title: 'Соединение',
    // frame: false,
    darkTheme: true,
    center: true,
    alwaysOnTop: true,
    width: 285,
    height: 271,
    // useContentSize: true,
    show: false,
    modal: true,
    minimizable: false,
    // maximizable:false,
    resizable: false,
    // movable: false
    icon: path.join(__dirname, '_icon/app_logo_Zqc_icon.ico'),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      devTools: true,
      allowRunningInsecureContent: true
    }
  });

  connectWindow.loadURL(winIndexpath('connectIndex.html',dev));
  connectWindow.setMenu(null);

  connectWindow.once('ready-to-show', () => {
    //FIX<E:
    // if (dev) {
    //   connectWindow.webContents.openDevTools();
    // }
    connectWindow.show();
  });

  log.info('[ConnectWindow] Creating.. finished');
  return connectWindow;
};

module.exports = { createConnectWindow };
