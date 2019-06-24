import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons' 

const mapIcon = ({mapFocus, entityType, entityID}) => {
    return (
        <span 
            className='map_icon'
            title='Показать объект на карте'
            onClick={mapFocus.bind(null, entityType, entityID)}>
            <FontAwesomeIcon icon={faMapMarkerAlt} />
        </span>
        
    );
}
 
export default mapIcon;