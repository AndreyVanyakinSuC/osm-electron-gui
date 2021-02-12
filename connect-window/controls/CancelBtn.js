import React from 'react';

const CancelBtn = ({ clicked }) => {
  return (
    <button
      id="cancel"
      className="cancel-btn"
      onClick={clicked}
      title="Закрыть окно"
    >
      Закрыть
    </button>
  );
};

export default CancelBtn;
