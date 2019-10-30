const axios = require('axios');
const log = require('electron-log');

let axiosInterceptor = null;

module.exports = (URL, request) => {
  // check if interceptors already exists

  if (!!axiosInterceptor || axiosInterceptor === 0) {
    axios.interceptors.request.eject(axiosInterceptor);
  }

  axiosInterceptor = axios.interceptors.request.use(req => {
    log.info('[AXIOS] Sending history request', req.data);
    // console.log(`Outbound POST request to ${URL}`);
    // log.info('%cGreen Main отправляет запрос истории по POST');
    return req;
  });

  return axios.post(URL, request);
};
