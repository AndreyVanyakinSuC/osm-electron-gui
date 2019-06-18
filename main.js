'use strict';

// Import parts of electron to use
const {app, BrowserWindow, dialog, Menu, ipcMain} = require('electron');
const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
const path = require('path');
const url = require('url');
const settings = require('electron-settings');
const EventSource = require('eventsource');
const axios = require('axios');
// Logging
const log = require('electron-log');
log.transports.rendererConsole.format = '%c{text}%c';
const _ = require('lodash');


// Storage setup

// Fix the colors
// app.commandLine.appendSwitch('force-color-profile','srgb');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.


let mainWindow, 
  connectWindow, 
  windows = [],
  es
  // es= new EventSource(`${settings.get('connectSettings').url}/sse`);


// Keep a reference for dev mode
let dev = false;
if ( process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ) {
  dev = true;
}

// HELPERS and API
// index = 'index.html'
const winIndexpath = (index) => {
  let indexPath;
  if ( dev && process.argv.indexOf('--noDevServer') === -1 ) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: index,
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, '/dist', index),
      slashes: true
    });
  }
  return indexPath
}

const isAutoConnect = () => (settings.get('connectSettings.isAutoconnect'));
const isConnecting = () => es.readyState === 0;
const isConnected = () => es.readyState === 1;
const isDisconnected = () => es.readyState === 2;
const printConnectionStatus = () => { 
  if (isDisconnected()) {
    return 'disconnected'
  } else if (isConnecting()) {
    return 'connecting'
  } else if (isConnected()) {
    return 'connected'
  } else {
    return 'unknown status'
  }
}


const saveConnectSettings = (args) => {
  
  const {url, pass, isAutoconnect} = args;
  
  console.log('Saving', url, pass, isAutoconnect);
  //  write dem to storage
  settings.set('connectSettings',{
    url: url,
    pass:pass,
    isAutoconnect: isAutoconnect
  })

}
const loadConnectSettings = () => (settings.get('connectSettings'));

const installReactDEvTools = () => {
  installExtension(REACT_DEVELOPER_TOOLS).then((name) => {
    console.log(`Added Extension:  ${name}`);
  })
    .catch((err) => {
      console.log('An error occurred: ', err);
    });
}
const createMainWindow = () => {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Система ОАИСКГН',
    width: 1024, 
    height: 768, 
    show: false,
    darkTheme: true

  });
  windows.push(mainWindow);

  mainWindow.loadURL( winIndexpath('mainIndex.html') );

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Open the DevTools automatically if developing
    if ( dev ) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('show', () => {
    

    // isConnecting() ? mainWindow.webContents.send('connection:connecting..') : null;
    // isConnected() ? mainWindow.webContents.send('connection:established') : null;

    // console.log('Showing main window');
    // log.info('%cGreen MainWindow.on(show) fired')
    // console.log('es.readyState',es.readyState, 'es.url', es.url);
    console.log('Main window show');
    // when showing main autoconnect if the settings are on
    if (isAutoConnect()) {
      connect();
    }

    // start receiving history requests
    ipcMain.on('history:new-request', (e, request) => {
      // log.info('Main process received "history:new-request"')
      console.log(`Main process received request`, request);

      requestHistory(loadConnectSettings().url,request);
    })

  })

  mainWindow.on('close', () => {
    windows = _.without(windows, mainWindow);
    // settings.set('connectSettings.isConnected', false);
    mainWindow.removeAllListeners('history:new-request')
  })
  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
  });

  // Enable custom menu
  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);

}

const createConnectWindow = () => {
  // Create the browser window.
  connectWindow = new BrowserWindow({
    parent: mainWindow,
    title: 'Соединение с сервером',
    // frame: false,
    darkTheme: true,
    center: true,
    alwaysOnTop: true,
    width: 310, 
    height: 250, 
    show: false, 
    modal: true,
    minimizable: false,
    // maximizable:false,
    resizable: true,
    // movable: false
  });

  windows.push(connectWindow);

  connectWindow.loadURL( winIndexpath('connectIndex.html') );
  connectWindow.setMenu(null)

  connectWindow.once('ready-to-show', () => {
    connectWindow.show()
    
    //     // Connect if autoconnect setting is on
    // if (isAutoConnect() && isConnectSettings()) {
    //   connect();
    // }

    // dev menu
    // if ( dev ) {
    //   connectWindow.webContents.openDevTools();
    // }

    // Listeners
    ipcMain.on('connectwindow:close', (e, args) => {
      connectWindow.close();
    });

    ipcMain.on('connection:connect', (e, args) => {
      saveConnectSettings(args);
      connect();
    });

    ipcMain.on('connection:disconnect', (e) => {
      disconnect();
    });

  });

  // When showing the window, feed it with massges
  connectWindow.on('show', () => {
    console.log('Connect window show', printConnectionStatus());

    isConnecting() ? connectWindow.webContents.send('connection:connecting..') : null;
    isConnected() ? connectWindow.webContents.send('connection:established') : null;
    isAutoConnect() ? connectWindow.webContents.send('connection:settings-available', loadConnectSettings()) : null;
  })
 

  // delete listeners when closed
  connectWindow.on('close', () => {
    ipcMain.removeAllListeners('connection:connect');
    ipcMain.removeAllListeners('connection:disconnect');
    windows = _.without(windows, connectWindow);
  });


}

const informAllWindows = (message, args = null) => {
  windows.forEach(w => {
    // window not created yet will be undef
    if (w !== undefined) {
      w.webContents.send(message, args);
    }
  });
}

const setupListeners = () => {
  

  // schema listener
  es.addEventListener('schema', e => {
    const schemaJson = e.data;
    // send schema to mainWindow
    mainWindow.webContents.send('schema:new', schemaJson);
  })

  // fresh listener
  es.addEventListener('fresh', e => {
    const freshJson = e.data;
    mainWindow.webContents.send('fresh:new', freshJson);
  })
}

const connect = () => {
  // Event source wont work if localhost is 0/0/0/0
  // const persistedURL = `${loadConnectSettings().url}/sse`;
  // const isLocalhost = _.includes(persistedURL, "http://0.0.0.0:");
  // const url = isLocalhost ? _.replace(persistedURL, "0.0.0.0", "localhost") : persistedURL;

  // Connect to event source only when not connected to the same URL OR is now disconnected 
  // const isSameUrl = es.url === url;
  // const isShouldConnect = !isSameUrl || isDisconnected();
  const isShouldConnect = true;
  
  console.log('Connect() ran');
  
  if (isShouldConnect) {

    es = new EventSource(`${loadConnectSettings().url}/sse`)
    
    // inform all windows we are connecting
    if (isConnecting()) {
      informAllWindows('connection:connecting..');
      // settings.set('connectStatus', 'connecting')
      // log.info(`%cGreen Main соединяется с  ${loadConnectSettings().url}`);
      console.log(`Connecting to ${es.url}`);
    }

    es.onopen = () => {
      console.log(`Connected to ${es.url}`);
      // settings.set('connectStatus', 'connected');
      // Let windows know we have a connection
      informAllWindows('connection:established', es.url);
      setupListeners();
    }

    let errCount = 0;
    es.onerror = (err) => {
      // Send info earch 1 sec, disconnect after 5 secs of errors
      setTimeout(() => {
        errCount = errCount + 1;
        informAllWindows('connection:connecting..')
        console.log(errCount);
        // log.info(`%cRed ${errCount} Неудачных попыток соединиться`);
        if (errCount > 4) {
          informAllWindows('connection:error', es.url);
          disconnect();
        }
      }, 1000);
    }

  } else {
    throw `Already connected to ${loadConnectSettings.url}`  
  }

}

//
// HISTORY
//

let axiosInterceptor = null;

const requestHistory = (URL, request) => {

// check if interceptors already exists

if (!!axiosInterceptor || axiosInterceptor === 0) {
  axios.interceptors.request.eject(axiosInterceptor);
}  
  
axiosInterceptor = axios.interceptors.request.use(req => {
  console.log(`Outbound POST request to ${URL}`);
  // log.info('%cGreen Main отправляет запрос истории по POST');
  mainWindow.webContents.send('history:request-fired');
  return req;
})

  // axios.interceptors.response.use(res => {
  //   console.log(`Response received, length`, res.data.length)
  //   return res;
  // })

axios.post(URL,request)
  .then(res => {
    // log.info('%cGreen Main получил ответ на POST с историей');
    console.log('Incoming POST response')
    mainWindow.webContents.send('history:new', JSON.stringify(res.data));
  })
  .catch(err => {
    mainWindow.webContents.send('history:request-failed', err);
    console.log(err)
  })
}

//
// HISTORY
//

const disconnect = () => {
  es.close();
  // settings.set('connectStatus','disconnected');
  informAllWindows('connection:closed');
}

  
//This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  
  installReactDEvTools();

  // preset disconnected
  // settings.set('connectStatus','disconnected');
  // settings.set('connectSettings.isConnected',false)
  // console.log(`URL in memory ${loadConnectSettings().url}`);
  // console.log(`${isAutoConnect() ? 'Will try to connect on startup' : 'Will not try to connect on strartup' }`);
  
    
  createMainWindow();
  // console.log('Is connected', isConnected());

  // Handling open connect window  click from main process
  ipcMain.on('connectWindow:create', () => {
    console.log('[IPC] Received connectWindow:create');
    createConnectWindow()
  } )


});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


const menuTemplate = [
  {
    label: 'Файл',
    submenu: [
      { label: 'Соединение..', click() {createConnectWindow() }},
      { label: 'Выйти', accelerator: 'Alt+Q', click() { app.quit(); } }
    ]
  },
  {
    label: 'Окно',
    submenu: [
      { label: 'Свернуть', accelerator: 'Ctrl+M', click() { } }
    ]
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
          })
        }
      },
      { 
        label: 'Сообщить об ошибке', 
        click() { console.log('[MENU] Сообщить об ошибке was сlicked'); } 
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
      },
    ]
  }

]

