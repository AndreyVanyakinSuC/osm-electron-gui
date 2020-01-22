import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import ProxyBlock from './UI/ProxyBlock';
import TileSourceBlock from './UI/TileSourceBlock';
import { SWINDOW_CLOSE, SWINDOW_RECEIVE, SWINDOW_SEND } from '../Electron/IPC';
import _ from 'lodash';

log.variables.label = 'MapW';

const DEFAULT = new Map([
  [
    'primary',
    {
      description: 'Топографическая карта',
      url: 'http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
    }
  ],
  [
    'secondary',
    {
      description: 'Стандартная карта',
      url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    }
  ]
]);

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
      password: '',
      availability: 'unknown'
    },
    primaryMap: {
      description: DEFAULT.get('primary').description,
      url: DEFAULT.get('primary').url
    },
    secondaryMap: {
      description: DEFAULT.get('secondary').description,
      url: DEFAULT.get('secondary').url
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
  }

  componentDidMount() {
    log.silly('CDM');
    ipcRenderer.on(SWINDOW_RECEIVE, (e, args) => {
      log.info('[IPC] Received _SWINDOW_RECEIVE_', args);
      this.setState(() => {
        return args;
      });
    });
  }

  componentWillUnmount() {
    log.silly('CDUnmount');
    ipcRenderer.removeAllListeners(SWINDOW_RECEIVE);
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
            description={this.state.primaryMap.description}
            url={this.state.primaryMap.url}
            inputChanged={this.handleMapInputChange.bind(this)}
          />
          <TileSourceBlock
            primary={false}
            description={this.state.secondaryMap.description}
            url={this.state.secondaryMap.url}
            inputChanged={this.handleMapInputChange.bind(this)}
          />
        </div>
        <div className="full-block">
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
