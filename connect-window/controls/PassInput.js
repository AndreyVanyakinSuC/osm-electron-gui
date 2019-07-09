import React from 'react';

const PassInput = ({ value, changed }) => {
  return (
    <div id="pass">
      <input type="password" name="password" value={value} onChange={changed} />
    </div>
  );
};

export default PassInput;
