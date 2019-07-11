const settings = require('electron-settings');
const log = require('electron-log');

const writeSettings = args => {
  const { url, isAutoconnect } = args;

  log.info('[SET] Writing settings', args);
  //  write dem to storage
  settings.set('connectSettings', {
    url: url, // url object
    isAutoconnect: isAutoconnect
  });
};

const readSettings = () => settings.get('connectSettings');

module.exports = { writeSettings, readSettings };
