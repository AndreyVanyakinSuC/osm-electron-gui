import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquare,
  faCheckSquare,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const ConfirmationCheck = ({ isActive, changed }) => {
  let icon, style;

  if (isActive) {
    icon = <FontAwesomeIcon icon={faCheckSquare} />;
    style = 'checked';
  } else {
    icon = <FontAwesomeIcon icon={faSquare} />;
    style = 'unchecked';
  }

  return (
    <div
      className="confirmation-check"
      onClick={changed}
      title="Сохранить настройки и подключаться автоматически при запуске программы"
    >
      <input type="checkbox" checked={isActive} />

      <span className={style}>{icon}</span>

      <label>Подключаться при запуске</label>
    </div>
  );
};

export default ConfirmationCheck;
