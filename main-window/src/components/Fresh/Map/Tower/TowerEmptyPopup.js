import React from 'react';
import { Popup } from 'react-leaflet';

const TowerEmptyPopup = ({ towerID, schema }) => {

    const {number, Name} = schema.towers[towerID];

    return (<Popup className='tower-popup'>
        <div> оп. №{number} <br/> типа {Name} </div>
    </Popup>);
}
 
export default TowerEmptyPopup;