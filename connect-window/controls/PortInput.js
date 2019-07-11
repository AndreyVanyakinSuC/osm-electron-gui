import React from 'react';
import MaskedInput from 'react-text-mask';

const portMask = [/[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/, /[0-9]/];

const PortInput = ({ value, changed }) => {
  return (
    <span id="port" title="Введите номер порта сервера">
      <MaskedInput
        placeholder="5000"
        value={value}
        guide
        mask={portMask}
        // showMask
        onChange={changed}
        placeholderChar={'\u2000'}
      />
    </span>
  );
};

export default PortInput;
