import React from 'react';
import HeaderSwitch from './HeaderSwitch';
import ConnectStatus from './ConnectStatus';

const Header = (props) => {

    const {
        ip,
        lastFreshMessageTS,
        onConnectClick,
        isConnected,
        isConnecting,
        isWaitingHistory,
        isSchemaAvailable, 
        isFreshAvailable,
        isCanShowFresh,
        isCanShowHistory,
        ribbonData,
        onModeChange,
        mode, 
    } = props;

    return (  
        <div className='app_header'>
            
            <ConnectStatus 
                ip={ip}
                lastFreshMessageTS={lastFreshMessageTS}
                onConnectClick={onConnectClick}
                isConnected = {isConnected}
                isConnecting ={isConnecting}
                isWaitingHistory={isWaitingHistory}
                isSchemaAvailable={isSchemaAvailable}
                isFreshAvailable={isFreshAvailable}/>
            <HeaderSwitch 
                mode={mode}
                onModeChange={onModeChange}
                isCanShowFresh = {isCanShowFresh}
                isCanShowHistory = {isCanShowHistory}
                ribbonData={ribbonData}/>
        </div>
    );
}
 
export default Header;