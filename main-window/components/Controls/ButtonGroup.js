import React from 'react';

const buttonGroup = ({ name, currentValues, valueChanged, options }) => {
  return (
    <div className={'btn-group'}>
      {options.map(o => {
        return (
          <div
            key={o.value}
            className={currentValues.includes(o.value) ? 'item active' : 'item'}
            onClick={valueChanged.bind(null, o.value)}
          >
            <input type={'checkbox'} id={o.value} value={o.value} />

            <label for={o.value}>{o.label}</label>
          </div>
        );
      })}
    </div>
  );
};

export default buttonGroup;
