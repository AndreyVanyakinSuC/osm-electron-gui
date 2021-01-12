const settings = require('electron-settings');
const log = require('electron-log');
const fs = require('fs');
const path = require('path');

const writeSettings = (store, args) => {
  // const { url, isAutoconnect } = args;

  log.silly('[SET] Writing settings', args);
  //  write dem to storage
  settings.set(store, args);
};

const readSettings = store => settings.get(store);

// check if any values in advanced setitngs
const hasSettings = store => settings.has(store);

const DEFAULTS_FALLBACK = {
  advanced: {
    isAddMsgToFresh: true,
    freshMaxPtsCount: 100,
    sseTimeoutSecs: 200,
    trendHrs: 8,
    trensMaxPtsCount: 40,
    historyShowHrs: 8,
    historyMaxPtsCount: 400,
    historySpanSecs: 300,
    isSaveHistoryReqs: false,
    isSaveHistoryReps: false
  },
  settings: {
    primary: {
      description: 'Топографическая карта',
      url: 'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
    },
    secondary: {
      description: 'Стандартная карта',
      url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    },
    proxy: {
      availability: 'unknown',
      domain_user: '',
      password: ''
    }
  }
};

//  set default advanced values
const setAdvancedDefaults = settings => {
  writeSettings('advanced', settings);
};

const setMapDefaults = settings => {
  writeSettings('settings', settings);
};

const initDefaults = dev => {
  // settings.setPath(path.resolve('./') + '/Settings.json');
  // log.info(`Settings can be found at ${settings.file()}`);

  let DEFAULT_SETTINGS, defaultsPath;
  if (dev) {
    // defaultsPath = path.join('./static/defaults.json');
    defaultsPath = path.resolve('./') + '/defaults.json';
  } else {
    defaultsPath = path.resolve('./') + '/defaults.json';
  }

  try {
    DEFAULT_SETTINGS = JSON.parse(fs.readFileSync(defaultsPath));

    log.silly(`Successfully read from default file @ ${defaultsPath}`);
  } catch (error) {
    log.error(
      `Could not read the defaults.json from ${defaultsPath}, using hardcoded fallback`,
      error
    );
    DEFAULT_SETTINGS = DEFAULTS_FALLBACK;
  } finally {
    return DEFAULT_SETTINGS;
  }
};

module.exports = {
  writeSettings,
  readSettings,
  hasSettings,
  setAdvancedDefaults,
  setMapDefaults,
  initDefaults
};
