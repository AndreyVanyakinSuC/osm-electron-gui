import React, { useContext } from 'react';
import TensionTrend from './TensionTrend';
import { UNITS } from '../../../../APInHelpers/base';
import { F_MODES } from '../../../../APInHelpers/history';
import SettingsContext from '../../../SettingsContext';
import RMSTrend from './RMSTrend';

const tensionBlock = ({
  wireID,
  F,
  FminTrend,
  FTrend,
  FmaxTrend,
  FrmsTrend,
  FYellowThreshold,
  FRedThreshold,
  focusChart
}) => {
  const { fMode } = useContext(SettingsContext);

  return (
    <span
      className="tension_block"
      title="Показать график тяжения участка"
      onClick={focusChart.bind(null, 'F', wireID)}
    >
      <TensionTrend
        FminTrend={FminTrend}
        FTrend={FTrend}
        FmaxTrend={FmaxTrend}
        FYellowThreshold={FYellowThreshold}
        FRedThreshold={FRedThreshold}
      />
      {F.toFixed(0)}
      <span className={'unit'}>{fMode === F_MODES.newton ? 'Н' : 'кгс'}</span>
      {/* <RMSTrend 
                FrmsTrend={FrmsTrend}
            /> */}
    </span>
  );
};

export default tensionBlock;
