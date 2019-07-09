import React from 'react';
import MapIcon from '../MapIcon';
import { UNITS } from '../../../../APInHelpers/base';

const rangeGeo = ({ id, distance, mapFocus }) => {
  return (
    <span className={'header_feature'}>
      <MapIcon mapFocus={mapFocus} entityType={'range'} entityID={id} />
      <span title="Протяженность участка">{distance}</span>
      <span className={'unit'}>{UNITS.get('L')}</span>
    </span>
  );
};

export default rangeGeo;
