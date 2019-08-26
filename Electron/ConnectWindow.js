const { BrowserWindow } = require('electron');
const { dev, winIndexpath } = require('./base');
const log = require('electron-log');

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
    resizable: true,
    // movable: false
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
