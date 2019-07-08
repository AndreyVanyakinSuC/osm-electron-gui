const { BrowserWindow } = require('electron');
const { dev, winIndexpath } = require('./base');
const log = require('electron-log');

const createMainWindow = function() {
  log.info('[MainWindow] Creating..');

  const mainWindow = new BrowserWindow({
    title: 'Система ОАИСКГН',
    width: 1024,
    height: 768,
    show: false,
    darkTheme: true,
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
