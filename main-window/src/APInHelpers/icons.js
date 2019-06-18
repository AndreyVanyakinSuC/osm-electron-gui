import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSnowflake, faAngleDoubleDown, faAngleDoubleUp} from '@fortawesome/free-solid-svg-icons'








export const ExpandToggle = ({isExpanded}) => {

    let icon;

    if (isExpanded) {
       icon = faAngleDoubleUp;
    } else {
        icon = faAngleDoubleDown;
    }

    return (<FontAwesomeIcon icon={icon}/>);     
}
