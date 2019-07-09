import React, { Component } from 'react';
import log from 'electron-log';
log.variables.label = 'CW';
import {
  CONNECTWINDOW__CLOSE,
  CONNECTWINDOW__SETTINGS,
  SOURCE__CONNECT,
  SOURCE__DISCONNECT,
  SOURCE__ISCONNECTING,
  SOURCE__ISCONNECTED,
  SOURCE__ISERROR,
  SOURCE__ISDISCONNECTED
} from '../Electron/IPC';
import IpInput from './controls/IpInput';
import PortInput from './controls/PortInput';
import PassInput from './controls/PassInput';
import CancelBtn from './controls/CancelBtn';
import ConnectBtn from './controls/ConnectBtn';
import ConfirmationCheck from './controls/ConfirmationCheck';
const { ipcRenderer } = require('electron');
import { purgeSpaces, getIP, getPort } from './helpers';

// Close window on ESC
window.addEventListener('keydown', e => {
  if (e.keyCode == 27) {
    log.verbose('[UI] ESC pressed');
    ipcRenderer.send(CONNECTWINDOW__CLOSE);
  }
});

class Connect extends Component {
  state = {
    ip: '',
    port: '',
    pass: '',
    isAutoconnect: false,
    isConnected: false,
    isConnecting: false
  };

  handleIPChange(event) {
    const ip = event.target.value;
    this.setState(() => ({ ip: ip }));
  }

  handlePortChange(event) {
    const port = event.target.value;
    this.setState(() => ({ port: port }));
  }

  handlePassChange(event) {
    const pass = event.target.value;
    this.setState(() => ({ pass: pass }));
  }

  handleCancelBtnClick() {
    // 1) contact Electron main process
    log.verbose('[UI] CANCEL clicked');
    ipcRenderer.send(CONNECTWINDOW__CLOSE);

    // if clicked when connecting => disconnect, else => close the window
    // if (this.state.isConnecting) {
    //     ipcRenderer.send('connection:disconnect')
    // } else {
    //     ipcRenderer.send('connectwindow:close')
    // }
  }

  handleConnectClick() {
    log.verbose('[UI] CONNECT clicked');
    // 1) combine ip+port, purge whitespaces, pass and autoconnect instructions
    const parcel = {
      url: purgeSpaces(`http://${this.state.ip}:${this.state.port}`),
      pass: this.state.pass,
      isAutoconnect: this.state.isAutoconnect
    };

    // 2) FIXME: checking
    // console.log(parcel.url);
    // console.table(parcel);
    // 3) contact Electron main process
    ipcRenderer.send(SOURCE__CONNECT, parcel);
  }

  handleDisconnectClick() {
    log.verbose('[UI] DISCONNECT clicked');
    ipcRenderer.send(SOURCE__DISCONNECT);
  }

  handleAutoConnectToggle() {
    this.setState(prevState => {
      log.verbose(`[UI] AUTOCONNECT set to ${!prevState.isAutoconnect}`);
      return { isAutoconnect: !prevState.isAutoconnect };
    });
  }

  componentDidMount() {
    ipcRenderer.on(CONNECTWINDOW__SETTINGS, (e, args) => {
      log.info('[IPC] Received _CONNECTWINDOW__SETTINGS_', args);
      const { url, pass, isAutoconnect } = args;

      this.setState(() => ({
        ip: getIP(url),
        port: getPort(url),
        pass: pass,
        isAutoconnect: isAutoconnect
      }));
    });

    ipcRenderer.on(SOURCE__ISCONNECTED, e => {
      log.info('[IPC] Received _SOURCE__ISCONNECTED_');
      this.setState(() => ({
        isConnected: true,
        isConnecting: false
      }));
    });

    ipcRenderer.on(SOURCE__ISCONNECTING, e => {
      log.info('[IPC] Received _SOURCE__ISCONNECTING_');
      this.setState(() => ({ isConnecting: true }));
    });

    ipcRenderer.on(SOURCE__ISDISCONNECTED, e => {
      log.info('[IPC] Received _SOURCE__ISDISCONNECTED_');
      this.setState(() => ({
        isConnected: false,
        isConnecting: false
      }));
    });
  }

  componentWillUnmount() {
    ipcRenderer.removeAllListeners(CONNECTWINDOW__SETTINGS);
    ipcRenderer.removeAllListeners(SOURCE__ISCONNECTED);
    ipcRenderer.removeAllListeners(SOURCE__ISCONNECTING);
    ipcRenderer.removeAllListeners(SOURCE__ISDISCONNECTED);
  }

  render() {
    return (
      <div className="connect-window-container">
        <div className="connect-window-text">
          Введите IP-адрес сервера и номера порт
        </div>

        <div className="inputs-container">
          <IpInput
            value={this.state.ip}
            changed={this.handleIPChange.bind(this)}
          />
          <PortInput
            value={this.state.port}
            changed={this.handlePortChange.bind(this)}
          />
        </div>

        <div className="connect-window-text">Введите пароль</div>

        <PassInput
          value={this.state.pass}
          changed={this.handlePassChange.bind(this)}
        />

        <ConfirmationCheck
          isActive={this.state.isAutoconnect}
          changed={this.handleAutoConnectToggle.bind(this)}
        />

        <div className="btn-strip">
          <CancelBtn clicked={this.handleCancelBtnClick} />
          <ConnectBtn
            isConnecting={this.state.isConnecting}
            isConnected={this.state.isConnected}
            clickedDisconnected={this.handleConnectClick.bind(this)}
            clickedConnected={this.handleDisconnectClick.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default Connect;
