import React from 'react';
import TensionTrend from './TensionTrend';
import { UNITS } from '../../../../APInHelpers/base';
import RMSTrend from './RMSTrend';

const tensionBlock = ({wireID, F, FminTrend, FTrend, FmaxTrend, FrmsTrend, FYellowThreshold, FRedThreshold, focusChart}) => {
    return (
        <span
            className={'tension_block'}
            onClick={focusChart.bind(null, "F", wireID)}>
            <TensionTrend 
                FminTrend={FminTrend}
                FTrend={FTrend} 
                FmaxTrend={FmaxTrend} 
                FYellowThreshold={FYellowThreshold}
                FRedThreshold={FRedThreshold} 
                />
            {F.toFixed(0)}
            <span className={'unit'}>{UNITS.get('F')}</span>
            {/* <RMSTrend 
                FrmsTrend={FrmsTrend}
            /> */}
            
        </span>
    );
}
 
export default tensionBlock;