const {BrowserWindow} = require('electron')
const EventSource = require('eventsource');
const urlExists = require('url-exists');
const {
    SOURCE__ISCONNECTING,
    SOURCE__ISCONNECTED,
    SOURCE__ISDISCONNECTED,
    SOURCE__ISERROR
} = require('./IPC')
const {readSettings} = require('./settings')
const log = require('electron-log');

let es;


// Will be updated by onerror and reset by onopen or by onclose
let errCount = 0;

const connect = function() {
    
    const url = readSettings().url + '/sse';

    urlExists(url, (err, exists) => {
        
        err ? log.error(`[SSE] Failed to define if ${url} exists`) : null;

        if (!exists) {
            log.info(`[SSE] URL ${url} does not exist, will not connect`);
        } else {
            log.info(`[SSE] URL ${url} exists. Will try to connect`)

            es = new EventSource(url);
            if (es.readyState === 0) {
                log.info(`[SSE] Connecting to ${es.url}..`)
                winsSend(SOURCE__ISCONNECTING);
            }
        }
    })
}

if (es !== undefined) {

    es.onopen = function() {
        log.info(`[SSE] Connected to ${es.url}`)
        errCount = 0;
        winsSend(SOURCE__ISCONNECTED);
    }
    
    es.onmessage = function(event) {
        // log.info(`[SSE] Connected to ${es.url}`)
    
        // MANAGE 
    }
    
    es.onerror = function (err) {
        errCount =+ 1;
        log.error(`[SSE] Error #${errCount} occured`+ err);
        winsSend.send(SOURCE__ISERROR);
    
        // If it tries to reconenct 
        if (es.readyState === 0) {
            log.info(`[SSE] Reconnecting..`)
            winsSend.send(SOURCE__ISCONNECTING);
        }
    
        // if it does not 
        if (es.readyState === 2) {
            log.info(`[SSE] Disconnected`)
            errCount = 0;
            winsSend.send(SOURCE__ISDISCONNECTED);
        }
    }
    
}



const disconnect = function() {
    es.close();
    if (es.readyState === 2) {
        log.info(`[SSE] Disconnected`)
        errCount = 0;
        winsSend.send(SOURCE__ISDISCONNECTED);
    }
}

const winsSend = function(IPC) {
    BrowserWindow.getAllWindows().forEach(win => {
        win.webContents.send(IPC);
    });
}



module.exports = {es, connect, disconnect}