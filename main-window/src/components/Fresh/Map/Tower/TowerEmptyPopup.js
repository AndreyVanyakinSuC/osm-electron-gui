import React from 'react';
import CopyCoordinatesBtn from './CopyCoordinatesBtn';
import { Popup } from 'react-leaflet';

const TowerEmptyPopup = ({ towerID, schema }) => {

    const {number, Name, coordinates} = schema.towers[towerID];

    return (
        <Popup className='tower-popup'>
            <div className='tower-popup-header empty'> 
                <div className = 'tower-nums'>
                    <div className='tower-number'>
                            <span className='unit'>№ </span>
                            <span>{number}</span>
                            <CopyCoordinatesBtn coordinates={coordinates}/>
                            <div className='unit'>{Name}</div>
                    </div>
                </div>
            </div>
        </Popup>);
}
 
export default TowerEmptyPopup;