import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons'

const CloseChartPane = ({onClick}) => {
    return (
        <div 
            className='btn'
            onClick={onClick} 
            title='Закрыть график' 
            role='button'>

            <FontAwesomeIcon icon={faTimes}/>

        </div>
    );
}
 
export default CloseChartPane;