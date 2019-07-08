const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS
} = require('electron-devtools-installer');
const path = require('path');
const url = require('url');
const log = require('electron-log');

// Keep a reference for dev mode
let dev = false;
if (
  process.defaultApp ||
  /[\\/]electron-prebuilt[\\/]/.test(process.execPath) ||
  /[\\/]electron[\\/]/.test(process.execPath)
) {
  dev = true;
}

const installReactDEvTools = function() {
  installExtension(REACT_DEVELOPER_TOOLS)
    .then(name => {
      log.verbose(`Extension ${name} added`);
    })
    .catch(err => {
      log.error(`Extension ${name} add error`, err);
    });
};

// index = 'index.html'
const winIndexpath = index => {
  let indexPath;
  if (dev && process.argv.indexOf('--noDevServer') === -1) {
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
  return indexPath;
};

module.exports = { dev, installReactDEvTools, winIndexpath };
