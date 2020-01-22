const settings = require('electron-settings');
const log = require('electron-log');

const writeSettings = (store, args) => {
  // const { url, isAutoconnect } = args;

  log.silly('[SET] Writing settings', args);
  //  write dem to storage
  settings.set(store, args);
};

const readSettings = store => settings.get(store);

module.exports = { writeSettings, readSettings };
