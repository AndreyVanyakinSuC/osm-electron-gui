import React from 'react';
import _ from 'lodash';
import Ribbon from '../Ribbon';
import { pickWorstMessage } from '../../APInHelpers/notification';

// currentMode = bool
// currentAlert = 'none', 'yellow', 'red'

const headerSwitch = ({
  mode,
  onModeChange,
  isCanShowFresh,
  isCanShowHistory,
  ribbonData
}) => {
  let freshKeyClasses = ['switch_key'];
  let historyKeyClasses = ['switch_key'];

  if (isCanShowFresh) {
    freshKeyClasses.push('available');
  }

  if (isCanShowHistory) {
    historyKeyClasses.push('available');
  }

  if (mode === 'fresh') {
    freshKeyClasses.push('enabled');
  } else if (mode === 'history') {
    historyKeyClasses.push('enabled');
  }

  // If BHistory is active AND there's an icing message => show Ribbon near Fresh btn, otherwise show nothing

  const ribbon =
    mode === 'history' ? (
      <Ribbon value={ribbonData.value} msgCode={ribbonData.msgCode} />
    ) : null;

  console.log('Ribbon Data in header', ribbonData);

  return (
    <div className="header-mode-switch-container">
      {/* Клавиfi current */}
      <span
        className={freshKeyClasses.join(' ')}
        title="Показать последние измерения"
        onClick={onModeChange.bind(null, 'fresh')}
      >
        {ribbon}
        <input type="radio" id="current-mode" value="fresh" />
        <label> Текущие </label>
      </span>

      {/* Клавиша history */}
      <span
        className={historyKeyClasses.join(' ')}
        title="Показать историю измерений"
        onClick={onModeChange.bind(null, 'history')}
      >
        <input type="radio" id="history-mode" value="history" />
        <label> История </label>
      </span>
    </div>
  );
};

export default headerSwitch;
