import React from 'react';

const rangeName = ({start, end}) => {

    const [startName, startHasSensors] = start;
    const [endName, endHasSensors] = end;

    return (
        <span 
            className='header_feature'
            title='Границы участка'>
            <span className='unit'>№№</span>
            <span className={startHasSensors ? 'bold' : null}> {startName}</span>
            <span>-</span>
            <span className={endHasSensors ? 'bold' : null}>{endName}</span>
        </span>
    );
}
 
export default rangeName;