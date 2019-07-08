const { app, BrowserWindow, dialog, Menu, ipcMain } = require('electron');
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
      devTools: dev
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

  //   Enable custom menu
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);

  log.info('[MainWindow] Creating.. finished');
  return mainWindow;
};

const menuTemplate = [
  {
    label: 'Файл',
    submenu: [
      {
        label: 'Соединение..',
        click() {
          createConnectWindow();
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
    submenu: [{ label: 'Свернуть', accelerator: 'Ctrl+M', click() {} }]
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
            message: 'Программа ОСМ ВЛ версия 1',
            detail: 'Очень очень хорощий программа'
          });
        }
      },
      {
        label: 'Сообщить об ошибке',
        click() {
          console.log('[MENU] Сообщить об ошибке was сlicked');
        }
      }
    ]
  },
  {
    label: 'Debug',
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

module.exports = { createMainWindow };
