const axios = require('axios');
const log = require('electron-log');
const { readSettings } = require('./settings');
const fs = require('fs');
const moment = require('moment');

let axiosInterceptor = null;

module.exports = (URL, request) => {
  // check if interceptors already exists

  if (!!axiosInterceptor || axiosInterceptor === 0) {
    axios.interceptors.request.eject(axiosInterceptor);
    axios.interceptors.response.eject(axiosInterceptor);
  }

  axiosInterceptor = axios.interceptors.request.use(req => {
    log.info('[AXIOS] Sending history request');
    if (readSettings('advanced').isSaveHistoryReqs) {
      writeJSON('./history/', 'req', req);
    }

    return req;
  });

  axiosInterceptor = axios.interceptors.response.use(res => {
    log.info('[AXIOS] Recieved response');
    if (readSettings('advanced').isSaveHistoryReps) {
      writeJSON('./history/', 'res', res);
    }

    return res;
  });

  return axios.post(URL, request);
};

const writeJSON = (subFolder, reqres, data) => {
  if (!fs.existsSync(subFolder)) {
    fs.mkdir(subFolder, err => {
      if (err) throw err;
    });
  }
  fs.writeFile(
    `${subFolder}${moment.now()}_${reqres}.json`,
    JSON.stringify(data.data),
    err => {
      if (err) throw err;
    }
  );
};
