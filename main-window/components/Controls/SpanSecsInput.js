import React from 'react';

const SpanSecsInput = ({ value, changed }) => {
  return (
    <input
      className="seconds-span"
      type="number"
      step="5"
      min="10"
      //   defaultValue={100}
      value={`${value} сек.`}
      onChange={changed}
      title="Скважность запроса истории (в секундах)"
    ></input>
  );
};

export default SpanSecsInput;
