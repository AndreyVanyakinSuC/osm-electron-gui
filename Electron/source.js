const { BrowserWindow } = require('electron');

const pify = require('pify');
const EventSource = require('eventsource');

const url = require('url');
const tcpp = require('tcp-ping');
const { PING_NOT_OK, PING_OK } = require('./events');
const {
  SOURCE__ISCONNECTING,
  SOURCE__ISCONNECTED,
  SOURCE__ISDISCONNECTED,
  MAINWINDOW__SCHEMA,
  MAINWINDOW__FRESH
} = require('./IPC');
const { readSettings } = require('./settings');
const log = require('electron-log');
const notifier = require('./notifier');
//

let es;

let keepaliveTimer = null;

// Will be updated by onerror and reset by onopen or by onclose
let errCount = 0;

// Connect to server
const connect = async () => {
  try {
    // 1) Read settings
    const server = new URL(readSettings('connectSettings').url);

    // 2) TCP ping ip:port
    log.silly(
      `[COM] Will check if ${server.hostname}:${server.port} responds to TCP pings`
    );
    const isAvailable = await tcpPing(server.hostname, parseInt(server.port));

    if (isAvailable) {
      // 3) Establish sse connection
      log.silly(`[SSE] TCP ping @ ${server.hostname} suceeded`);
      notifier.emit(PING_OK);
      server.pathname = '/sse';

      es = new EventSource(server.href);

      if (es.readyState === 0) {
        log.info(`[SSE] Connecting to ${es.url}..`);
        // notifier.emit(CONNECTING, es.url);
        ipcRadio(SOURCE__ISCONNECTING, es.url);
      }

      es.onopen = () => {
        errCount = 0;
        gotActivity();
        log.info(`[SSE] Connected to ${es.url}`);
        ipcRadio(SOURCE__ISCONNECTED, es.url);

        es.addEventListener('schema', schemaAction);
        es.addEventListener('fresh', freshAction);
        es.addEventListener('ping', pingAction);
      };

      es.onerror = err => {
        if (errCount <= 5) {
          log.error('[SSE] Error occured', err);
          es.removeListener('schema', schemaAction);
          es.removeListener('fresh', freshAction);
          es.removeListener('ping', pingAction);
          errCount = errCount + 1;
        } else {
          disconnect();
        }
      };
    } else {
      // Inform log and index
      log.silly(`[SSE] TCP ping @ ${server.hostname} failed`);
      notifier.emit(PING_NOT_OK, `${server.hostname}`);
    }
  } catch (error) {
    log.error(error);
  }
};

const disconnect = function() {
  es.close();

  if (es.readyState === 2) {
    log.info(`[SSE] Disconnected`);
    errCount = 0;
    ipcRadio(SOURCE__ISDISCONNECTED, es.url);
  }
};

const reconnect = () => {
  disconnect();
  connect();
};

// SSE MESSAGE ACTIONS

const schemaAction = message => {
  gotActivity();
  log.silly(`[SSE] Received schema`);
  ipcRadio(MAINWINDOW__SCHEMA, message.data);
};

const freshAction = message => {
  gotActivity();
  log.silly(`[SSE] Received fresh`);
  ipcRadio(MAINWINDOW__FRESH, message.data);
};

const pingAction = () => {
  gotActivity();
  log.silly(`[SSE] Received ping`);
};

// TCP PING

const tcpPing = (ip, portInt) =>
  pify(tcpp.probe)(ip, portInt)
    .then(isAvailable => isAvailable)
    .catch(err => log.error(`[COM] Check failed`, err.stack));

// ACTIVITY TIMER, START EACH TIME A MESSAGE FROM SERVER IS RECEIVED AND LASTS FOR X SECONDS, IF NO MESSAGES DURING SPAN => RECONNECT
const gotActivity = () => {
  if (keepaliveTimer !== null) {
    // log.verbose('[TIMER] Cleared')
    clearTimeout(keepaliveTimer);
  }

  keepaliveTimer = setTimeout(() => {
    log.verbose('[TIMER] Expired');
    reconnect();
  }, readSettings('advanced').sseTimeoutSecs * 1000);

  // log.verbose('[TIMER] set')
};

const ipcRadio = (IPC, args) => {
  // console.log(BrowserWindow.getAllWindows().length);
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send(IPC, args);
  });
};

// RETURNS AN IPC CORRESPONDING TO CURRENT ES STATUS
const connectStatusIPC = () => {
  if (es === undefined || es === null || es.readyState === 2) {
    return SOURCE__ISDISCONNECTED;
  } else if (es.readyState === 1) {
    return SOURCE__ISCONNECTED;
  } else if (es.readyState === 0) {
    return SOURCE__ISCONNECTING;
  } else {
    console.error('Unknown scenario');
    return null;
  }
};

// RETURNS THE ES.URL
const esUrl = () => es.url;

module.exports = { connect, disconnect, reconnect, connectStatusIPC, esUrl };
