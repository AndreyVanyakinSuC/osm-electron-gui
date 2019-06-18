import React from 'react';

const CancelBtn = ({clicked}) => {
    return (
        <button id="cancel"
            className='cancel-btn'
            onClick={clicked}>
            Отмена
        </button>
    );
}
 
export default CancelBtn;