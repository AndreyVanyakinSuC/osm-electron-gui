import React from 'react';

function NumericInput({ value, changed, id, label, title }) {
  return (
    <div className="numeric-input" title={title}>
      <input type="numeric" id={id} value={value} onChange={changed} />

      <label>{label}</label>
    </div>
  );
}

export default NumericInput;
