import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine } from '@fortawesome/free-solid-svg-icons' 

const chartIcon = ({isScoped}) => {
    return (  
        <span className={ isScoped ? 'chart_icon blue' : 'chart_icon' }>
            <FontAwesomeIcon icon={faChartLine} />
        </span>
        
    );
}
 
export default chartIcon;