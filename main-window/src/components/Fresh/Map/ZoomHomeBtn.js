import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons'

const ZoomHomeBtn = ({onClick}) => {
    return (<div className='leaflet-bar'>
            <a className='leaflet-control-zoom-in' 
                href='#' 
                title='Zoom home' 
                role='button'
                onClick={onClick}>
                <FontAwesomeIcon icon={faExpandArrowsAlt}/>
            </a>
        </div>);
}
 
export default ZoomHomeBtn;