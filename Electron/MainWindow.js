const { BrowserWindow } = require('electron');
const { dev, winIndexpath } = require('./base');
const log = require('electron-log');
const path = require('path');

const createMainWindow = function() {
  log.info('[MainWindow] Creating..');

  const mainWindow = new BrowserWindow({
    title: 'Система ОАИСКГН',
    width: 1024,
    height: 768,
    show: false,
    darkTheme: true,
    icon: path.join(__dirname, '_icon/app_logo_Zqc_icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      devTools: dev,
      allowRunningInsecureContent: true
    }
  });

  mainWindow.loadURL(winIndexpath('mainIndex.html'));

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    // Open the DevTools automatically if developing
    if (dev) {
      mainWindow.webContents.openDevTools();
    }
    mainWindow.show();
  });

  log.info('[MainWindow] Creating.. finished');
  return mainWindow;
};

module.exports = { createMainWindow };
