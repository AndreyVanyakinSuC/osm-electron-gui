import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnowflake } from '@fortawesome/free-solid-svg-icons';
import { UNITS, MSGS } from '../APInHelpers/base';

const Ribbon = ({ value, msgCode, isHasIcon = false }) => {
  // Render icon on demand
  const icon = isHasIcon ? <FontAwesomeIcon icon={faSnowflake} /> : null;

  // if no message code => do not apply animation, just show plain value
  // if message code undefined (no fresh yet => show plain ribbon )
  const ribbonClass =
    msgCode === null || msgCode === undefined || msgCode === ''
      ? 'ribbon'
      : `ribbon ${MSGS.get(msgCode).class}`;

  // if value = null, display nothing
  let markup;
  if (value === null) {
    markup = null;
  } else {
    markup = (
      <span className={ribbonClass}>
        {icon} {value.toFixed(1)}
        <span className="unit">{UNITS.get('I')}</span>
      </span>
    );
  }

  return markup;
};

export default Ribbon;
