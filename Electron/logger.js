const path = require('path');

const initLogger = (log, label) => {
  log.transports.file.file = path.resolve('./') + '/Лог.log';
  log.variables.label = label;
  log.transports.console.format =
    '[{y}-{d}-{m} {h}:{i}:{s}.{ms}] [{label}] [{level}] {text}';
  log.transports.file.format =
    '[{y}-{d}-{m} {h}:{i}:{s}.{ms}] [{label}] [{level}] {text}';
};

module.exports = { initLogger };
