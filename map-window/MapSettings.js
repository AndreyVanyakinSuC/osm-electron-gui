import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import ProxyBlock from './UI/ProxyBlock';
import TileSourceBlock from './UI/TileSourceBlock';
import {
  SWINDOW_CLOSE,
  SWINDOW_RECEIVE,
  SWINDOW_SEND,
  SWINDOW_DEF_REQ,
  SWINDOW_DEF_RES
} from '../Electron/IPC';
import _ from 'lodash';

log.variables.label = 'MapW';

// Close window on ESC without setting up the settings
window.addEventListener('keydown', e => {
  if (e.keyCode == 27) {
    log.verbose('[UI] ESC pressed');
    ipcRenderer.send(SWINDOW_CLOSE);
  }
});

class MapSettings extends Component {
  state = {
    proxy: {
      domain_user: '',
      password: ''
    },
    primary: {
      description: '',
      url: ''
    },
    secondary: {
      description: '',
      url: ''
    }
  };

  handleProxyInputChange(event) {
    const { value, name } = event.target;
    // console.log(name, value);
    this.setState(prevState => {
      return _.merge(prevState, { proxy: { [name]: value } });
    });
    // console.log(this.state);
  }

  handleMapInputChange(event) {
    const { value, name, id } = event.target;

    this.setState(prevState => {
      return _.merge(prevState, { [id]: { [name]: value } });
    });
    // console.log(this.state);
  }

  handleCloseClick() {
    log.silly('[IPC] Sending settings to main');
    ipcRenderer.send(SWINDOW_SEND, this.state);
    ipcRenderer.send(SWINDOW_CLOSE);
  }

  handleDefaultClick(event) {
    ipcRenderer.send(SWINDOW_DEF_REQ);
  }

  componentDidMount() {
    log.silly('CDM');
    ipcRenderer.on(SWINDOW_RECEIVE, (e, args) => {
      log.info('[IPC] Received _SWINDOW_RECEIVE_', args);
      this.setState(() => {
        return args;
      });
    });
    ipcRenderer.on(SWINDOW_DEF_RES, (e, args) => {
      log.info('[IPC] Received _SWINDOW_DEF_RES_', args);
      const { primary, secondary } = args;
      this.setState(() => ({ primary: primary, secondary: secondary }));
    });
  }

  componentWillUnmount() {
    log.silly('CDUnmount');
    ipcRenderer.removeAllListeners(SWINDOW_RECEIVE);
    ipcRenderer.removeAllListeners(SWINDOW_DEF_RES);
  }

  render() {
    const { domain_user, password } = this.state.proxy;

    return (
      <div className="settings-window">
        <ProxyBlock
          domain_user={domain_user}
          password={password}
          inputChanged={this.handleProxyInputChange.bind(this)}
        />
        <div className="full-block">
          <div className="block-header">Источники карт-подложки</div>
          <TileSourceBlock
            primary={true}
            description={this.state.primary.description}
            url={this.state.primary.url}
            inputChanged={this.handleMapInputChange.bind(this)}
          />
          <TileSourceBlock
            primary={false}
            description={this.state.secondary.description}
            url={this.state.secondary.url}
            inputChanged={this.handleMapInputChange.bind(this)}
          />
        </div>
        <div className="center-block">
          <button
            id="default"
            className="btn"
            onClick={this.handleDefaultClick.bind(this)}
            title="Выставить адреса и описание источников тайлов карт по умолчанию"
          >
            Источники по умолчанию
          </button>
        </div>
        <div className="center-block">
          <button
            id="close"
            className="btn"
            onClick={this.handleCloseClick.bind(this)}
            title="Сохранить данные и закрыть окно"
          >
            Сохранить и закрыть
          </button>
        </div>
      </div>
    );
  }
}

export default MapSettings;
