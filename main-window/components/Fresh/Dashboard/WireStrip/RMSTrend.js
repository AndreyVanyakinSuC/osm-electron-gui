import React from 'react';
import {
  Sparklines,
  SparklinesCurve,
  SparklinesBars
} from '../../../../HOC/SparkMe';

const rmsTrend = ({ FrmsTrend }) => {
  return (
    <Sparklines data={FrmsTrend}>
      <SparklinesBars
        style={{
          strokeWidth: 5,
          stroke: '#D9DBDB',
          strokeOpactity: 1
          // fillOpacity: 1
        }}
      />
    </Sparklines>
  );
};

export default rmsTrend;
