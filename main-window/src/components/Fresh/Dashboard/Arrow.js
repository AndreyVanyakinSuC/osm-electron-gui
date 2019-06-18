import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretRight } from '@fortawesome/free-solid-svg-icons' 
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'

const arrow = ({isExpanded}) => {
    return (
        <span className={'arrow'}>
            <FontAwesomeIcon  icon={ isExpanded ? faCaretDown : faCaretRight}/>
        </span>
      );

}
 
export default arrow;