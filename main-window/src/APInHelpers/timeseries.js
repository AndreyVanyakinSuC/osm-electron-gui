import moment from 'moment';
import _ from 'lodash';
import downsampler from 'downsample-lttb';
import { TREND_PTS } from './base';

// in dataArr out max ts
export const maxTS = dataArr => _.max(dataArr.map(d => d.ts));

// in fresh out max ts
export const freshMaxTS = fresh =>
  _.max(_.values(_.mapValues(fresh, f => f.ts)));

// for plotly shaeps  @Therefore we'll use underscore for this purpose: 2015-02-21_13:45:56.789@
export const ts_UnderscoredString = ts =>
  moment.unix(ts).format('YYYY-MM-D_HH:mm:ss.SSS');

export const tsmili__UnderscoredString = ts =>
  moment(ts).format('YYYY-MM-D_HH:mm:ss.SSS');

//(_.max(...Object.keys(fresh).map(key => fresh[key].ts)))

// IN unix second OUT -//- minus x hrs
export const minusHrs = (uts, hours) =>
  moment
    .unix(uts)
    .subtract(hours, 'hours')
    .unix();
export const plusHrs = (uts, hours) =>
  moment
    .unix(uts)
    .add(hours, 'hours')
    .unix();

// IN [[x,y], [x,y] ... [x,y]] => OUT downsampled, pts = how many points on chart
export const downsample = (XYpairs, pts) => {
  if (XYpairs.length <= pts) {
    return XYpairs;
  } else {
    return downsampler.processData(XYpairs, pts);
  }
};

//
// TIMEFORMATS CONVERSION
//

// IN date object OUT uts
export const date_UTS = date => moment(date).unix();
// reverse
export const uts_Date = uts => moment.unix(uts).toDate();

export const nowTS = () => moment().unix();
// IN ts or arr in secs OUT ts in msecs
export const unixMiliSecs = unixSecs => {
  const convert = uts => moment.unix(uts).valueOf();
  ('');

  if (_.isNumber(unixSecs) || _.isString(unixSecs)) {
    return convert(unixSecs);
  } else if (_.isArray(unixSecs)) {
    return _.map(unixSecs, uts => convert(uts));
  }
};
// one unix arr of string to human arr
export const displayHuman = unixSecs => {
  if (_.isArray(unixSecs)) {
    return unixSecs.map(u => moment.unix(u).format('HH:mm:ss'));
  } else if (_.isString(unixSecs) || _.isNumber(unixSecs)) {
    return moment.unix(unixSecs).format('HH:mm:ss');
  }
};
//

// IN => dataArr wo trends + trendmaterial, OUT => -//- w/ trends
export const addTrends = (freshPack, trendMaterial) => {
  const freshArr = freshPack.map(f => {
    const objId = f.obj;

    f.ITrend = formTrend(trendMaterial, objId, 'I');
    f.FTrend = formTrend(trendMaterial, objId, 'F');
    f.FmnTrend = formTrend(trendMaterial, objId, 'Fmn');
    f.FmxTrend = formTrend(trendMaterial, objId, 'Fmx');
    f.FrmsTrend = formTrend(trendMaterial, objId, 'Frms');
    // console.log('Trends added');
    return f;
  });

  return _.keyBy(freshArr, f => f.obj); // make an object 1: {}, ...
};

// IN dataArr, objId, propName OUT downsampled [Y arr]
const formTrend = (trendMaterial, objId, propName) => {
  const xyPairs = _.sortBy(
    trendMaterial
      .filter(tm => tm.obj === objId)
      .map(tm => [tm.ts, tm[propName]]),
    tm => tm[0]
  ); // sort by ts

  // console.log('Xy pairs', xyPairs);

  return downsample(xyPairs, TREND_PTS).map(xy => xy[1]); // return only Ys
};

// OUT
// ***[TREND] STARTS HERE***
// [
//     "1": {
//         ITrend: [y arr]
//         FTrend: [y arr]
//         FminTrend: [y arr]
//         FmaxTrend: [y arr]
//         FrmsTrend: [y arr]
//     },
//     "2": {},
//     "3": {},
//     "m": {}
// ]
