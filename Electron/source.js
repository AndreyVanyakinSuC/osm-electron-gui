const pify = require('pify');
const EventSource = require('eventsource');

const url = require('url');
const tcpp = require('tcp-ping');
const {
  PING_NOT_OK,
  PING_OK,
  CONNECTING,
  CONNECTED,
  ISERROR,
  ISDISCONNECTED,
  RECONNECTING
} = require('./events');
const { readSettings } = require('./settings');
const log = require('electron-log');
const notifier = require('./notifier');
//

let es;

// Will be updated by onerror and reset by onopen or by onclose
let errCount = 0;

// Connect to server
const connect = async () => {
  // 1) Read settings
  const server = new URL(readSettings().url);

  // 2) TCP ping ip:port
  log.info(
    `[COM] Will check if ${server.hostname}:${server.port} responds to TCP pings`
  );
  const isAvailable = await tcpPing(server.hostname, parseInt(server.port));

  if (isAvailable) {
    // 3) Establish sse connection
    log.info(`[SSE] TCP ping @ ${server.hostname} suceeded`);
    notifier.emit(PING_OK);
    server.pathname = '/sse';

    es = new EventSource(server.href);

    if (es.readyState === 0) {
      log.info(`[SSE] Connecting to ${es.url}..`);
      notifier.emit(CONNECTING, es.url);
    }

    es.onopen = () => {
      errCount = 0;
      log.info(`[SSE] Connected to ${es.url}`);
      notifier.emit(CONNECTED, es.url);
    };

    es.onmessage = event => {
      // log.info(`[SSE] Connected to ${es.url}`)
      // MANAGE
    };

    es.onerror = err => {
      log.error(`[SSE] Error #${errCount} occured` + err.stack);
      notifier.emit(ISERROR, err.stack);

      const isShouldReconnect = await tcpPing(server.hostname, parseInt(server.port));

      if (isShouldReconnect) {
        
        errCount = errCount + 1;

      } else {
        disconnect();
      }



      // errCount = errCount + 1;
      // // If it tries to reconenct
      // if (es.readyState === 0) {
      //   log.info(`[SSE] Reconnecting..`);
      //   notifier.emit(RECONNECTING);
      // }

      // // if it does not
      // if (es.readyState === 2) {
      //   log.info(`[SSE] Disconnected`);
      //   errCount = 0;
      //   notifier.emit(ISDISCONNECTED);
      // }
    };
  } else {
    // Inform log and index
    log.info(`[SSE] TCP ping @ ${server.hostname} failed`);
    notifier.emit(PING_NOT_OK, `${server.hostname}`);
  }
};

const disconnect = function() {
  es.close();
  if (es.readyState === 2) {
    log.info(`[SSE] Disconnected`);
    errCount = 0;
    notifier.emit(ISDISCONNECTED);
  }
};

// TCP PING

const tcpPing = (ip, portInt) =>
  pify(tcpp.probe)(ip, portInt)
    .then(isAvailable => isAvailable)
    .catch(err => log.error(`[COM] Check failed`, err.stack));

module.exports = { es, connect, disconnect };
