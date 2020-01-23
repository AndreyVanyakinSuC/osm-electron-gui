const settings = require('electron-settings');
const log = require('electron-log');

const writeSettings = (store, args) => {
  // const { url, isAutoconnect } = args;

  log.silly('[SET] Writing settings', args);
  //  write dem to storage
  settings.set(store, args);
};

const readSettings = store => settings.get(store);

// check if any values in advanced setitngs
const hasSettings = store => settings.has(store);

const DEFAULT_ADVANCED = {
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
};

const DEFAULT_MAP = {
  primary: {
    description: 'Топографическая карта',
    url: 'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  },
  secondary: {
    description: 'Стандартная карта',
    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  }
};

//  set default advanced values
const setAdvancedDefaults = () => {
  writeSettings('advanced', DEFAULT_ADVANCED);
};

const setMapDefaults = () => {
  writeSettings('settings', DEFAULT_MAP);
};

module.exports = {
  writeSettings,
  readSettings,
  hasSettings,
  setAdvancedDefaults,
  setMapDefaults,
  DEFAULT_ADVANCED,
  DEFAULT_MAP
};
