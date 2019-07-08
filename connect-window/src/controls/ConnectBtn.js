import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

const CancelBtn = ({
  isConnecting,
  isConnected,
  clickedDisconnected,
  clickedConnected
}) => {
  let onClick, btnContent;

  if (isConnected) {
    onClick = clickedConnected;
    btnContent = 'Отключиться';
  } else if (!isConnected) {
    if (isConnecting) {
      onClick = () => null;
      btnContent = (
        <div>
          <span className="spinner">
            {' '}
            <FontAwesomeIcon icon={faCircleNotch} spin />{' '}
          </span>
          Соединяемся..
        </div>
      );
    } else if (!isConnecting) {
      onClick = clickedDisconnected;
      btnContent = 'Соединиться';
    }
  }

  // const onClick = isConnected ? clickedConnected : clickedDisconnected;
  // const btnString = () => {if (isConnecting) {
  //         return ' Соединямся..'
  //     } else {
  //         return isConnected ? 'Отключиться' : 'Соединиться';
  //     }
  // }

  return (
    <button id="connect" className="connect-btn" onClick={onClick}>
      {btnContent}
    </button>
  );
};

export default CancelBtn;
