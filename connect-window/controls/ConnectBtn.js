import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

const CancelBtn = ({
  isValidIPInput,
  isConnecting,
  isConnected,
  clickedDisconnected,
  clickedConnected
}) => {
  let onClick, btnContent, classes, title;

  if (isConnected) {
    onClick = clickedConnected;
    btnContent = 'Отключиться';
    title = 'Отключиться от сервера';
  } else if (!isConnected) {
    if (isConnecting) {
      title = 'Соединение в процессе..';
      onClick = null;
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
      btnContent = 'Соединиться';
      // Disable button when no minimal input
      if (isValidIPInput) {
        classes = 'connect-btn';
        title = 'Соединиться с сервером';
        onClick = clickedDisconnected;
      } else {
        classes = 'connect-btn disabled';
        title = 'Введите корректный IP-адрес';
        onClick = null;
      }
    }
  }

  return (
    <button id="connect" className={classes} onClick={onClick} title={title}>
      {btnContent}
    </button>
  );
};

export default CancelBtn;
