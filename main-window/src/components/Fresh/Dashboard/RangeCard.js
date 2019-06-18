import React, {Component} from 'react';
import RangeHeader from './RangeHeader/RangeHeader';
import WireStrip from './WireStrip/WireStrip';
import _ from 'lodash';


const rangeCard = ({rangeID, lineID, schema, fresh, isScoped, changeScope, mapFocus, focusChart}) => {
      
    const wires = _.sortBy(schema.ranges[rangeID].obj, id => schema.obj[id].Type);

    // check if fresh misses some data for ANY

    return (
        
        <div className={'range_card'}>
            {/* MANAGES MISSING FRESH INSIDE */}
            <RangeHeader 
                rangeID={rangeID} 
                lineID={lineID}
                schema={schema} 
                fresh={fresh}
                mapFocus={mapFocus}
                isScoped={isScoped}
                changeScope={changeScope}/>

            <div className={'wire_strips'}>
                {wires.map(wireID => 
                   <WireStrip 
                        key={`wire${wireID}`} 
                        wireID={wireID} 
                        schema={schema} 
                        fresh={fresh}
                        focusChart={focusChart}/>
                )}

            </div>
            
        </div>
    )
}
    
 
export default rangeCard;