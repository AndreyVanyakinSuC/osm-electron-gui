import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSquare,
  faCheckSquare,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const ConfirmationCheck = ({ isActive, changed, id, label, title }) => {
  let icon, style;

  if (isActive) {
    icon = <FontAwesomeIcon icon={faCheckSquare} />;
    style = 'checked';
  } else {
    icon = <FontAwesomeIcon icon={faSquare} />;
    style = 'unchecked';
  }

  return (
    <div id={id} className="confirmation-check" onClick={changed} title={title}>
      <input type="checkbox" checked={isActive} />

      <span className={style}>{icon}</span>

      <label>{label}</label>
    </div>
  );
};

export default ConfirmationCheck;
