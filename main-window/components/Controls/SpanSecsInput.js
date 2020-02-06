import React from 'react';

const SpanSecsInput = ({ value, changed }) => {
  return (
    <input
      className="seconds-span"
      type="number"
      step="10"
      min="0"
      //   defaultValue={100}
      value={value}
      onChange={changed}
      title="Скважность запроса истории (в секундах)"
    ></input>
  );
};

export default SpanSecsInput;
