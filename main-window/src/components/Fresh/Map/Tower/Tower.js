import React from 'react';
import {Marker} from 'react-leaflet';
import TowerIcon from './TowerIcon';
import TowerEmptyPopup from './TowerEmptyPopup';
import TowerSensorsPopup from './TowerSensorsPopup';

const tower = ({towerID, schema, fresh, focusChart}) => {
    
    const {hasSensors, Type, coordinates} = schema.towers[towerID];

    const isHasSensors = hasSensors;
    const isDE = Type === 'DE' ? true : false;
    
    // different description if has sensors or not
    let popup;
   
    if (isHasSensors) {
        

        popup = <TowerSensorsPopup 
            towerID= {towerID}
            fresh = {fresh}
            focusChart={focusChart}
            schema ={schema} />

    } else {

        popup = <TowerEmptyPopup 
            towerID= {towerID}
            schema ={schema} />


    }
    




   

    return (
        <Marker 
            // ref={`tower_${towerID}`}
            position={coordinates}
            draggable={false}
            icon={TowerIcon(isHasSensors, isDE)}>

                { popup }

        </Marker>
    );
}
 
export default tower;