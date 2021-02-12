const { BrowserWindow } = require('electron');
const { winIndexpath } = require('./base');
const log = require('electron-log');
const path = require('path');

const createAdvancedWindow = function(mainWindow, dev) {
  log.info('[MapSettingsWindow] Creating..');

  const advancedWindow = new BrowserWindow({
    parent: mainWindow,
    title: 'Настройки',
    // frame: false,
    darkTheme: true,
    center: true,
    alwaysOnTop: true,
    width: 410,
    height: 520,
    // useContentSize: true,
    show: false,
    modal: true,
    minimizable: true,
    // maximizable:false,
    resizable: true,
    // movable: false
    icon: path.join(__dirname, '_icon/app_logo.ico'),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      devTools: true,
      allowRunningInsecureContent: true
    }
  });

  advancedWindow.loadURL(winIndexpath('advancedIndex.html', dev));
  advancedWindow.setMenu(null);

  advancedWindow.once('ready-to-show', () => {
    // FIX<E:
    // if (dev) {
    //   advancedWindow.webContents.openDevTools();
    // }
    advancedWindow.show();
  });

  log.info('[advancedWindow] Creating.. finished');
  return advancedWindow;
};

module.exports = { createAdvancedWindow };
