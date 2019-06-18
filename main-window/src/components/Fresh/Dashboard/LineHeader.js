import React from 'react';
import Ribbon from '../../Ribbon';
import MapIcon from './MapIcon';
import Arrow from './Arrow';


const lineHeader = ({lineID, lineName, ribbonData, isExpanded, rangesCount, mapFocus}) => {
    
    const rangeString = 'уч.'
    const {value, msgCode} = ribbonData;
    
    // Don't show ribbon when expanded, even if dangerous
    let ribbonMarkup;

    if (isExpanded) {
        ribbonMarkup = null;
    } else {
        ribbonMarkup =<Ribbon value={value} msgCode={msgCode}/>
    }

    return (
        <div className={'line_header'}>
            <span>
                <Arrow isExpanded={isExpanded}/>
                {lineName}
            </span>
            
            

            <span>
                <span className='ribbon_container'>
                    {ribbonMarkup}
                </span>
        
                
                <MapIcon 
                    mapFocus={mapFocus}
                    entityType={'line'}
                    entityID={lineID}/>
                {rangesCount}<span className={'unit'}>{rangeString}</span>
            </span>
        </div>
    );
}
 
export default lineHeader;