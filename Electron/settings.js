const settings = require('electron-settings');
const log = require('electron-log')

const writeSettings = (args) => {
  
    const {url, pass, isAutoconnect} = args;
    
    log.info('[SET] Writing', args)
    //  write dem to storage
    settings.set('connectSettings',{
      url: url,
      pass:pass,
      isAutoconnect: isAutoconnect
    })
  
  }

  const readSettings = () => (settings.get('connectSettings'));

  module.exports = {writeSettings, readSettings }