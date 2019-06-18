import React from 'react';

const iceSpeed = ({VI}) => {
    return (  
        <span>
            {VI.toFixed(1)}
            <span className='unit'>мм/час</span>
        </span>     
    );
}
 
export default iceSpeed;