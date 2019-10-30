const { BrowserWindow } = require('electron');
const { winIndexpath } = require('./base');
const log = require('electron-log');
const path = require('path');

const createMainWindow = function(dev) {
  log.info('[MainWindow] Creating..');

  const mainWindow = new BrowserWindow({
    title: 'Система ОАИСКГН',
    width: 1024,
    height: 768,
    show: false,
    darkTheme: true,
    icon: path.join(__dirname, '_icon/app_logo_Zqc_icon.ico'),
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      devTools: true,
      allowRunningInsecureContent: true
    }
  });

  const htmlPath = winIndexpath('mainIndex.html', dev);
  // const htmlPath = `file://C:/_Demo/osm-electron-gui/dist/mainIndex.html`
  log.silly('Main HTML path', htmlPath);
  mainWindow.loadURL(htmlPath);

  // log.info('Main window', winIndexpath('mainIndex.html'), __dirname)
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
