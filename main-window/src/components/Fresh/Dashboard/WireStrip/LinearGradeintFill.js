import React from 'react';

const linearGradientFill = (color1, offset1, color2, offset2) => {
    return (  
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
			<stop offset={`${offset1}%`} stopColor={`${color1}%`} stopOpacity="1" />
            <stop offset={`${offset2}%`} stopColor={`${color2}%`} stopOpacity="0" />
		</linearGradient>
    );
}


 
export default linearGradientFill;