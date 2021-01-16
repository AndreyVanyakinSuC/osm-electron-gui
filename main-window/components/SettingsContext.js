import React, { createContext } from 'react';
import { I_MODE, F_MODES } from '../APInHelpers/history';

const SettingsContext = createContext({
  iceMode: I_MODE.kg_per_m,
  fMode: F_MODES.kgs,
  spanLength: 200
});

export default SettingsContext;
