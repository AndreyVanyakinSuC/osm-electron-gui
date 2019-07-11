const { BrowserWindow } = require('electron');
const EventSource = require('eventsource');

const url = require('url');
const tcpp = require('tcp-ping');
const { PING_NOT_OK, PING_OK } = require('./events');
const {
  SOURCE__ISCONNECTING,
  SOURCE__ISCONNECTED,
  SOURCE__ISDISCONNECTED,
  SOURCE__ISERROR
} = require('./IPC');
const { readSettings } = require('./settings');
const log = require('electron-log');
const notifier = require('./notifier');
//

let es;

// Will be updated by onerror and reset by onopen or by onclose
let errCount = 0;

// Connect to server
const connect = () => {
  // 1) Read settings
  const serverHref = new URL(readSettings().url);

  // 2) Ping host ip:port
  const isPingOk = isPing(serverHref.hostname, parseInt(serverHref.port));

  if (!isPingOk) {
    log.info('[SSE] Server ping unsuccessful');
    notifier.emit(PING_NOT_OK, `${serverHref.host}`);
    return null;
  }

  // 3) Establish sse
  notifier.emit(PING_OK);
  serverHref.pathname = '/sse';

  es = new EventSource(serverHref.href);
  if (es.readyState === 0) {
    log.info(`[SSE] Connecting to ${es.url}..`);
    winsSend(SOURCE__ISCONNECTING);
  }
};

if (es !== undefined) {
  es.onopen = function() {
    log.info(`[SSE] Connected to ${es.url}`);
    errCount = 0;
    winsSend(SOURCE__ISCONNECTED);
  };

  es.onmessage = function(event) {
    // log.info(`[SSE] Connected to ${es.url}`)
    // MANAGE
  };

  es.onerror = function(err) {
    errCount = +1;
    log.error(`[SSE] Error #${errCount} occured` + err);
    winsSend.send(SOURCE__ISERROR);

    // If it tries to reconenct
    if (es.readyState === 0) {
      log.info(`[SSE] Reconnecting..`);
      winsSend.send(SOURCE__ISCONNECTING);
    }

    // if it does not
    if (es.readyState === 2) {
      log.info(`[SSE] Disconnected`);
      errCount = 0;
      winsSend.send(SOURCE__ISDISCONNECTED);
    }
  };
}

const disconnect = function() {
  es.close();
  if (es.readyState === 2) {
    log.info(`[SSE] Disconnected`);
    errCount = 0;
    winsSend.send(SOURCE__ISDISCONNECTED);
  }
};

const winsSend = function(IPC) {
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send(IPC);
  });
};

// Ping server bool
const isPing = (ip, portInt) => {
  log.verbose(`[SSE] Checking if ${ip}:${portInt} responds to pings`);
  return tcpp.probe(ip, portInt, (err, available) => {
    if (err) log.error(`[SSE] Ping @ ${ip}:${portInt} failed`, err);
    return available;
  });
};

module.exports = { es, connect, disconnect };
