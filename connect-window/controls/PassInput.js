import React from 'react';

const PassInput = ({ value, changed }) => {
  return (
    <div id="pass">
      <input
        type="password"
        name="password"
        value={value}
        onChange={changed}
        title="Введите пароль"
      />
    </div>
  );
};

export default PassInput;
