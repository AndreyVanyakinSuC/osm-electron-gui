import React from 'react';
import TensionBlock from './TensionBlock';
import IceBlock from './IceBlock';
import _ from 'lodash';
import { ENTITY_NAMES } from '../../../../APInHelpers/base';

const wireStrip = ({ wireID, schema, fresh, focusChart }) => {
  // Check if there's a fresh for this WireID
  const isFreshComing = fresh[wireID] !== undefined;

  // Get the max and min of all trends TODO: move up
  const allTrends = _.flatten(
    Object.keys(fresh).map(key => {
      return fresh[key].ITrend;
    })
  );
  // const trendBounds = [Math.min(...allTrends), Math.max(...allTrends)]
  // Always show 0 mm on trend
  const trendBounds = [0, Math.max(...allTrends)];

  if (isFreshComing) {
    return (
      <div className={'strip'}>
        <span title={schema.obj[wireID].sensorID}>
          {ENTITY_NAMES.get(schema.obj[wireID].Type)}
        </span>

        <TensionBlock
          wireID={wireID}
          F={fresh[wireID].F}
          FminTrend={fresh[wireID].FmnTrend}
          FTrend={fresh[wireID].FTrend}
          FmaxTrend={fresh[wireID].FmxTrend}
          FrmsTrend={fresh[wireID].FrmsTrend}
          FYellowThreshold={schema.obj[wireID].Fy}
          FRedThreshold={schema.obj[wireID].Fr}
          focusChart={focusChart}
        />
        <IceBlock
          wireID={wireID}
          I={fresh[wireID].I}
          iceYellowThreshold={schema.obj[wireID].Iy}
          iceRedThreshold={schema.obj[wireID].Ir}
          trend={fresh[wireID].ITrend}
          trendBounds={trendBounds}
          VI={fresh[wireID].VI}
          focusChart={focusChart}
          msg={fresh[wireID].msg}
        />
      </div>
    );
  } else {
    return (
      <div className={'strip'}>
        <span>{ENTITY_NAMES.get(schema.obj[wireID].Type)}</span>
        <span>ожидаем данные ..</span>
      </div>
    );
  }
};

export default wireStrip;
