import React from 'react';
import {
  Sparklines,
  SparklinesCurve,
  SparklinesArea
} from '../../../../HOC/SparkMe';

const tensionTrend = ({
  FminTrend,
  FTrend,
  FmaxTrend,
  FYellowThreshold,
  FRedThreshold
}) => {
  const centerLine = FminTrend.map((v, i) => {
    return (FminTrend[i] + FmaxTrend[i]) / 2;
  });
  const normalizedUp = FmaxTrend.map((v, i) => {
    return FmaxTrend[i] - centerLine[i];
  });
  const normalizedTrend = FTrend.map((v, i) => {
    return -centerLine[i] + FTrend[i];
  });
  const normalizedDown = FminTrend.map((v, i) => {
    return FminTrend[i] - centerLine[i];
  });

  return (
    <span className={'trend'}>
      <Sparklines
        data={normalizedTrend}
        upLimit={normalizedUp}
        downLimit={normalizedDown}
      >
        <SparklinesCurve
          style={{
            strokeWidth: 5,
            stroke: '#D9DBDB',
            strokeOpactity: 1
            // fillOpacity: 1
          }}
        />

        <SparklinesArea
          style={{
            // strokeWidth: 2,
            // stroke: '#D9DBDB',
            fillOpacity: 0.25,
            fill: '#3DFF82'
          }}
        />
      </Sparklines>
    </span>
  );
};

export default tensionTrend;
