import React, { Component } from 'react';
// import IpInput from './controls/IpInput';
import IpInput from './controls/IpInput';
import PortInput from './controls/PortInput';
import PassInput from './controls/PassInput';
import CancelBtn from './controls/CancelBtn';
import ConnectBtn from './controls/ConnectBtn';
import ConfirmationCheck from './controls/ConfirmationCheck';
const { ipcRenderer } = require('electron')
import { purgeSpaces, getIP, getPort } from './helpers';

// Close window on ESC 
window.addEventListener('keydown', e => e.keyCode == 27 ? ipcRenderer.send('connectwindow:close') : null)

class Connect extends Component {

    state = {
        ip: '',
        port: '',
        pass: '',
        isAutoconnect: false,
        isConnected: false,
        isConnecting:false
    }

    handleIPChange(event) {
        const ip = event.target.value;
        this.setState( () => ({ip: ip}))
    }

    handlePortChange(event) {
        const port = event.target.value
        this.setState(() => ({port: port}))
    }

    handlePassChange(event) {
        const pass = event.target.value
        this.setState(() => ({pass: pass}))
    }
   
    handleCancelBtnClick() {
        // 1) contact Electron main process

        ipcRenderer.send('connectwindow:close')

        // if clicked when connecting => disconnect, else => close the window
        // if (this.state.isConnecting) {
        //     ipcRenderer.send('connection:disconnect')
        // } else {
        //     ipcRenderer.send('connectwindow:close')
        // }

        
    }

    handleConnectClick() {

        // 1) combine ip+port, purge whitespaces, pass and autoconnect instructions
        const parcel =  {
            url: purgeSpaces(`http://${(this.state.ip)}:${this.state.port}`),
            pass:this.state.pass,
            isAutoconnect: this.state.isAutoconnect
        }

        // 2) FIXME: checking
        // console.log(parcel.url);
        // console.table(parcel);
        // 3) contact Electron main process
        ipcRenderer.send('connection:connect', parcel)

    }

    handleDisconnectClick() {
        
        ipcRenderer.send('connection:disconnect')
    }

    handleAutoConnectToggle() {
        this.setState(prevState => ({isAutoconnect: !prevState.isAutoconnect}))
    }

    componentDidMount() {
        ipcRenderer.on('connection:settings-available', (e, args) => {

            const {url, pass, isAutoconnect} = args;

            this.setState(() => ({
                ip: getIP(url),
                port: getPort(url),
                pass: pass,
                isAutoconnect: isAutoconnect
            }))

        });

        ipcRenderer.on('connection:established', e => {
            console.log('Connection established');
            this.setState(() =>({
                    isConnected: true,
                    isConnecting:false
                }))
        });

        ipcRenderer.on('connection:connecting..', e => {
            console.log('Connecting..');
            this.setState(() => ({isConnecting: true}))
        })

        ipcRenderer.on('connection:closed', e => {
            console.log('Connection closed');
            this.setState(() =>({
                isConnected: false,
                isConnecting: false
            }))
        });
    }

    // componentDidUpdate() {
    //     ipcRenderer.on('connection:established', e => {
    //         console.log('Connection established');
    //         this.setState(() =>({
    //                 isConnected: true,
    //                 isConnecting:false
    //             }))
    //     });

    //     ipcRenderer.on('connection:closed', e => {
    //         console.log('Connection closed');
    //         this.setState(() =>({isConnected: false}))
    //     });
    // }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners('connection:settings-available')
        ipcRenderer.removeAllListeners('connection:established')
        ipcRenderer.removeAllListeners('connection:closed')
    }

    render() {
        return (
            <div className='connect-window-container'> 
               
                

                <div className='inputs-container'>

                    <div className='connect-window-text'>
                        Введите IP-адрес сервера и номера порт 
                    </div>

                    <IpInput 
                        value = {this.state.ip}
                        changed = {this.handleIPChange.bind(this)}/>
                    <PortInput
                        value = {this.state.port}
                        changed = {this.handlePortChange.bind(this)}/>
                </div>
         
                <div className='inputs-container'>

                    <div className='connect-window-text'>
                        Введите пароль
                    </div>

                    <PassInput 
                        value = {this.state.pass}
                        changed = {this.handlePassChange.bind(this)}/>
                </div>


                
                <ConfirmationCheck 
                    isActive={this.state.isAutoconnect}
                    changed={this.handleAutoConnectToggle.bind(this)}
                    />

                <div className='btn-strip'>
                    <CancelBtn 
                        clicked={this.handleCancelBtnClick}/>
                    <ConnectBtn 
                        isConnecting={this.state.isConnecting}
                        isConnected={this.state.isConnected}
                        clickedDisconnected={this.handleConnectClick.bind(this)}
                        clickedConnected={this.handleDisconnectClick.bind(this)}
                        />
                </div>

                
            </div>  
        )
    }

}

export default Connect;