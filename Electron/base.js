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
    const urlObject = new URL(`http://localhost:8080/${index}`);
    indexPath = urlObject.toString();
  } else {
    indexPath = url.pathToFileURL(path.join(__dirname, index)).toString();
  }
  return indexPath;
};

module.exports = { installReactDEvTools, winIndexpath };
