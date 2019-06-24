import React from 'react';
import IceTrend from './IceTrend';
import Ribbon from '../../../Ribbon'
import { UNITS, MSGS } from '../../../../APInHelpers/base';

const iceBlock = ({wireID, I, trend, trendBounds, changeScope, VI, iceYellowThreshold, iceRedThreshold, focusChart, msg}) => {
    
    // const ribbonClasses = `ribbon ${MSGS.get(msg[0]).class}`
    
    return (
        <span 
            className='ice_block'
            title='Показать график гололёда для участка'
            onClick={focusChart.bind(null, "I", wireID)}>
            <IceTrend 
                data={trend}
                trendBounds={trendBounds}
                iceYellowThreshold={iceYellowThreshold}
                iceRedThreshold={iceRedThreshold}
                changeScope={changeScope}/>

            <Ribbon
                value={I}
                msgCode={msg[0]}/>
            {/* <span className={ribbonClasses}>
                {I.toFixed(1)}
                <span className="unit">{UNITS.get('I')}</span>
            </span> */}

        </span>
    );
}
 

export default iceBlock;
