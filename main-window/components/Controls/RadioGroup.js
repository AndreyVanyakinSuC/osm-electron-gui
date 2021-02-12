import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle, faDotCircle } from '@fortawesome/free-solid-svg-icons';

const radioGroup = ({ currentValue, valueChanged, isIcon, options }) => {
  return (
    <div className={'btn-group'}>
      {options.map(o => {
        let classes, icon;

        const isActive = currentValue === o.value;

        if (isActive) {
          icon = <FontAwesomeIcon icon={faDotCircle} />;
          classes = 'item active';
        } else {
          icon = <FontAwesomeIcon icon={faCircle} />;
          classes = 'item';
        }

        if (!isIcon) {
          icon = null;
        }

        return (
          <div
            key={o.value}
            className={classes}
            onClick={valueChanged.bind(null, o.value)}
          >
            <input type="radio" id={o.value} value={o.value} />

            <span>{icon}</span>

            <label>{o.label}</label>
          </div>
        );
      })}
    </div>
  );
};

export default radioGroup;
