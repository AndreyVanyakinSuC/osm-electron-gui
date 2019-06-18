import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faCircleNotch, faTimesCircle,  } from '@fortawesome/free-solid-svg-icons' 

const ConnectStatus = ({
    isConnected, 
    isConnecting, 
    isWaitingHistory,
    isSchemaAvailable,
    isFreshAvailable }) => {

    let icon, classes, message, stage;

    if (isConnected) {

        if (isWaitingHistory) {
            icon = <FontAwesomeIcon icon = {faCircleNotch} spin/>
            classes = 'connect-icon connected';
            message = 'Соединено';
            stage = 'Запрашиваем архивные данные с сервера..';
        } else {
            icon = <FontAwesomeIcon icon = {faCircle}/>
            classes = 'connect-icon connected';
            message = 'Соединено';
            stage = '';
        }
        
    } else if (!isConnected) {

        if (isConnecting) {
            icon = <FontAwesomeIcon icon = {faCircleNotch} spin />
            classes = 'connect-icon connecting';
            message = 'Соединяемся..';
    
            if (!isSchemaAvailable) {
                stage= 'получаем описание..'            
            } else if (!isFreshAvailable) {
                stage= 'получаем последние данные..'            
            }
    
    
        } else {
            
            icon = <FontAwesomeIcon icon = {faTimesCircle} />
            classes = 'connect-icon disconnected';
            message = 'Соединение не установлено';
            stage = null;
        }

        
    }



    return (
        <div className='connect-status-container'>
            <span className={classes}>
                {icon}
            </span>
            
            <span className='connect-message'>
                {message}
            </span>

            <span className='connect-message'>
                {stage}
            </span>
        

        </div>
    );
}
 
export default ConnectStatus;