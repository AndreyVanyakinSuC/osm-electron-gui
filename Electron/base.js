const {
  default: installExtension,
  REACT_DEVELOPER_TOOLS
} = require('electron-devtools-installer');
const path = require('path');
const url = require('url');
const log = require('electron-log');

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
const winIndexpath = (index, dev) => {
  let indexPath;
  
  if (dev) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:8080',
      pathname: index,
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, index),
      // pathname: path.join(__dirname, '../dist', index),
      slashes: true
    });
  }
  return indexPath;
};

module.exports = { installReactDEvTools, winIndexpath };
