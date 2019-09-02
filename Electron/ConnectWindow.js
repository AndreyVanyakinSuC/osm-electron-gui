const { BrowserWindow } = require('electron');
const { dev, winIndexpath } = require('./base');
const log = require('electron-log');
const path = require('path');

const createConnectWindow = function(mainWindow) {
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
      nodeIntegration: true,
      devTools: dev,
      allowRunningInsecureContent: true
    }
  });

  connectWindow.loadURL(winIndexpath('connectIndex.html'));
  connectWindow.setMenu(null);

  connectWindow.once('ready-to-show', () => {
    if (dev) {
      // connectWindow.webContents.openDevTools();
    }
    connectWindow.show();
  });

  log.info('[ConnectWindow] Creating.. finished');
  return connectWindow;
};

module.exports = { createConnectWindow };
