const { BrowserWindow } = require('electron');
const { winIndexpath } = require('./base');
const log = require('electron-log');
const path = require('path');

const createMapSettingsWindow = function(mainWindow, dev) {
  log.info('[MapSettingsWindow] Creating..');

  const mapSettingsWindow = new BrowserWindow({
    parent: mainWindow,
    title: 'Настройки',
    // frame: false,
    darkTheme: true,
    center: true,
    alwaysOnTop: true,
    width: 350,
    height: 480,
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

  mapSettingsWindow.loadURL(winIndexpath('mapIndex.html', dev));
  mapSettingsWindow.setMenu(null);

  mapSettingsWindow.once('ready-to-show', () => {
    //FIX<E:
    // if (dev) {
    //   mapSettingsWindow.webContents.openDevTools();
    // }
    mapSettingsWindow.show();
  });

  log.info('[mapSettingsWindow] Creating.. finished');
  return mapSettingsWindow;
};

module.exports = { createMapSettingsWindow };
