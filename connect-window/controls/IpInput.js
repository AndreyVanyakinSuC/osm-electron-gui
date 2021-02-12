import React from 'react';
import MaskedInput from 'react-text-mask';
import _ from 'lodash';

const IpInput = ({ value, changed, isValidIPInput }) => {
  return (
    <span
      id="ip"
      title="Введите IP-адрес сервера"
      className={!isValidIPInput ? 'invalid' : null}
    >
      <MaskedInput
        placeholder="255.255.255.255"
        mask={value => Array(value.length).fill(/[\d.]/)}
        pipe={value => {
          if (value === '.' || value.endsWith('..')) return false;

          const parts = value.split('.');

          if (
            parts.length > 4 ||
            parts.some(part => part === '00' || part < 0 || part > 255)
          ) {
            return false;
          }

          // Remove non dots or integers
          const filtered = _.filter(
            value,
            v =>
              ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(v) ||
              v === '.'
          ).join('');

          return filtered;
        }}
        value={value}
        onChange={changed}
      />
    </span>
  );
};

export default IpInput;
