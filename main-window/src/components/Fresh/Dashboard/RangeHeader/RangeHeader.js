import React from 'react';
import RangeName from './RangeName';
import RangeGeo from './RangeGeo';
import RangeTemp from './RangeTemp';
import RangeChart from './RangeChart';
// import {median} from 'mathjs';
import _ from 'lodash';

const rangeHeader = ({rangeID, lineID, isScoped, schema, fresh, changeScope, mapFocus }) => {

    // console.log(`range ${rangeID} is scoped? ${isScoped}`);

        const towerIDs = schema.ranges[rangeID].towers;
        const towerNames = towerIDs.map(v => {return schema.towers[v].number})
        const sensorsFlag = towerIDs.map(v => {return schema.towers[v].hasSensors})
        
        // do not include undefind temp readings for missing fresh 
        const thisRangeFreshObjIDs = _.filter(_.keys(fresh), k => _.includes(schema.ranges[rangeID].obj, parseInt(k)));
        const temp = _.mean(thisRangeFreshObjIDs.map(o => ( fresh[o].Tamb)))
        
        return (  
            <div className={'range_header'}>
                <RangeName 
                    start={[towerNames[0], sensorsFlag[0]]}
                    end={[towerNames[1], sensorsFlag[1]]}
                />
                <RangeGeo 
                    id={rangeID}
                    mapFocus={mapFocus}
                    distance={_.round(schema.ranges[rangeID].distance,1)}
                />
                <RangeTemp 
                    temp={temp}
                    />
                <RangeChart 
                    rangeID={rangeID}
                    isScoped ={isScoped}
                    changeScope ={changeScope}
                    />
            </div>
        );

    }

    

    
 
export default rangeHeader;