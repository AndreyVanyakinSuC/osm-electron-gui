import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquare, faCheckSquare, faCheck } from '@fortawesome/free-solid-svg-icons' 

export default ( { isActive, isDisabled, isIcon, label, clicked } ) => {
    
    let classes, icon;

    if (isActive) {
        classes = 'btn active';
        icon = <FontAwesomeIcon icon={faCheckSquare} />;
    } else {

        if (isDisabled) {
            classes = 'btn disabled';
        } else {
            classes = 'btn';
            icon = <FontAwesomeIcon icon={faSquare} />;
        }
       
    }


    if (!isIcon) {
        icon = null
    }

    

    // let classes = isActive ? 'btn active' : 'btn'

    
    return (
        <div 
            className={classes}
            onClick={clicked}>
            <span className='btn-icon'>
                {icon}
            </span>
            
            <span className='btn-text'>
                {label}
            </span>
            
        </div>
    );
}
 