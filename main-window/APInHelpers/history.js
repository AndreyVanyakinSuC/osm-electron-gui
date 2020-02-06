import { readPKsByTSRanges, filterTss } from './database';
import { displayHuman } from './timeseries';
import _ from 'lodash';
import { writeFileSync, writeFile } from 'fs';

export const setRecommendedSpan = (intervalSecs, HISTORY_CHART_PTS) => {
  const calcedSpan = intervalSecs / (3 * HISTORY_CHART_PTS);

  let span;
  // Finest span = 10 secs, not less
  if (calcedSpan <= 10) {
    span = 10;
    // if calculated span is between 10 secs and 60 secs = round it to tens of seconds ie 43 => 40 secs
  } else if (calcedSpan > 10 && calcedSpan < 60) {
    span = _.round(calcedSpan, -1);
  } else if (calcedSpan >= 60 && calcedSpan < 3600) {
    // if calced span is 1 to 60 minutes, then round to 1 minute
    span = _.round(calcedSpan / 60) * 60;
  }
  return span;
};

// pick all pks (ts+obj) in range
// IN [ts start, ts end], [objids]

// Sign msgs
// IN [freshes with empty msgs field] out [freshes with msgs filled]
export const addMsgs = freshArr =>
  freshArr.map(f => {
    const out = f;
    if (f.I <= 1) {
      out.I = 0;
      out.msg = ['000'];
    } else if (f.I > 1 && f.I <= 5) {
      out.msg = ['011'];
    } else if (f.I > 5 && f.I <= 10) {
      out.msg = ['012'];
    } else if (f.I > 10 && f.I <= 20) {
      out.msg = ['013'];
    } else if (f.I > 20) {
      out.msg = ['014'];
    }
    return out;
  });

// Will not account for the data already present in idb
export const prepareSimpleHistoryRequest = async (
  needMin,
  needMax,
  objIDs,
  secsSpan
) => objIDs.map(o => ({ [o]: [[needMin, needMax, secsSpan]] }));

// will request only the data thta is missing in the idb
export const prepareHistoryRequest = async (
  needMin,
  needMax,
  objIDs,
  secsSpan
) => {
  // [ts+obj, ts+obj ... ts+obj]
  // console.log(needMin, needMax)
  // [[ts, obj], [ts, obj] ... [ts, obj]]
  // const pks = await readPKsByTSRanges(objIDs, [[needMin, needMax]]);
  // console.log(pks);

  return readPKsByTSRanges(objIDs, needMin, needMax).then(pks => {
    // timestamps per object
    return objIDs.map(o => {
      // filter tss for this object
      const gotTssArr = filterTss(pks, o);

      // calc missing segments
      const segments = calcMissingSegments(
        gotTssArr,
        needMin,
        needMax,
        secsSpan
      );

      // return   "1": [[ts1, ts2, dts], [ts3, ts4, dts]]
      return { [o]: segments };
    });
  });
};

// Define missing segments given amn tss arr ONE OBJECT ONLY
// IN = tss arr for one obj, [desired start, desired end], desired dts
// OUT = [[ts1; ts2, dts], [ts3, ts4, dts] .. [ts3, ts4, dts]]

const calcMissingSegments = (gotTssArr, needMin, needMax, secsSpan) => {
  const gotMin = _.min(gotTssArr);
  const gotMax = _.max(gotTssArr);

  // console.log('Got', displayHuman([gotMin,gotMax]), 'Need', displayHuman([needMin,needMax]));

  let spans = [];

  if (gotTssArr.length === 0) {
    spans.push([needMin, needMax, secsSpan]);
  } else {
    // some prehistory
    if (gotMin - needMin > secsSpan) {
      spans.push([needMin, gotMin, secsSpan]);
    }

    // some future data missing (dunno how)
    if (needMax - gotMax > secsSpan) {
      spans.push([gotMax, needMax, secsSpan]);
    }

    // Check if there are missing secs
    if (gotTssArr.length - 1 !== gotMax - gotMin) {
      // console.log('(maximin)', (max-min), 'gotTssArr length', gotTssArr.length);

      // partition missing ranges
      for (let i = 1; i < gotTssArr.length; i++) {
        if (gotTssArr[i] - gotTssArr[i - 1] > secsSpan) {
          spans.push([gotTssArr[i - 1], gotTssArr[i], secsSpan]);
        }
      }
    }
  }

  // console.log(spans);

  return spans;
};

// IN request and response objects LOGS STUFF and OUT the history
export const checkHistory = (request, history) => {
  // History format [{fresh}, {fresh} ... {fresh}]
  //console.log('History at checker inlet', history)

  // 1) Подсчитать ожидаемое количество ts vs фактическое для каждого объекта
  const objectIDs = request.map(v => Object.keys(v).join(''));
  // console.log('checkHistory, объекты из запроса', objectIDs);

  let tableResult = [];
  let briefresult = [];

  objectIDs.forEach(id => {
    // find all received tss for this object
    const thisObjHistory = subsetObj(history, id);
    // console.log(`History for object ${id}`, thisObjHistory);
    const receivedTSs = getActualTSs(thisObjHistory);
    //console.log(`Received ${actualTSs.length} TSs for object ${id}`)

    // get approptiate request line [[ts1, ts2, dts], [ts3, ts4, dts]]

    const requestLine = _.find(request, r => r[id])[id];
    // console.log(`Object ${id} had the following requestline`, requestLine);
    const requestedTSs = _.flatten(requestLine.map(rl => calcExpectedTSs(rl)));

    const matchingTSs = _.intersection(receivedTSs, requestedTSs);
    // get missing tss
    const missingTSs = _.difference(requestedTSs, receivedTSs);
    //const missingMessage = missing.length === 0 ? 'No missing tss' : missing;

    const extraTSs = _.difference(matchingTSs, receivedTSs);

    briefresult.push({
      id: id,
      reqCount: requestedTSs.length,
      reqPreview: firstLastN(displayHuman(requestedTSs), 3),
      req: displayHuman(requestedTSs),
      resCount: receivedTSs.length,
      resPreview: firstLastN(displayHuman(receivedTSs), 3),
      res: displayHuman(receivedTSs)
    });

    tableResult.push({
      id: id,
      reqCount: requestedTSs.length,
      reqPreview: firstLastN(displayHuman(requestedTSs), 2),
      resCount: receivedTSs.length,
      resPreview: firstLastN(displayHuman(receivedTSs), 2),
      matchCount: matchingTSs.length,
      //matchingMinMax: minmax(matchingTSs),
      missCount: missingTSs.length,
      ///missingMinMax: minmax(missingTSs),
      extra: extraTSs.length
      //extraMinMax: minmax(extraTSs)
    });
    //console.log(`Object ID= ${id}`,`Expected tss count = ${expectedTSs.length}`,`Actual tss count = ${actualTSs.length}`,`${missingMessage}`)
  });

  //console.table(tableResult)
  // console.table(briefresult);

  return history;
};

// filter fresh by objids []
// export const filterFresh = (fresh, objIds) => ( _.filter(fresh, f => _.includes(objIds, f.obj)))

export const filterFresh = (fresh, objIds) =>
  _.pickBy(fresh, f => _.includes(objIds, f.obj));

//
// CHECK HISTORY HELPERS
//

// IN history for several objs OUT history for one object
export const subsetObj = (history, objID) =>
  history.filter(h => h.obj === parseInt(objID));

//[ts1, ts2, dts] ts2 > ts1 => [ts, ts,  ts ... ts]
const calcExpectedTSs = timespanRequest => {
  //console.log('Using this to calculate expectd tss', timespanRequest)

  const tsStart = timespanRequest[0];
  const tsEnd = timespanRequest[1];
  const dts = timespanRequest[2];

  //console.log(tsStart > tsEnd)

  if (tsStart < tsEnd) {
    // проверка что правильная посоледовательность)
    let tss = [];
    let tsCur = tsEnd;
    while (tsCur >= tsStart) {
      tss.push(tsCur);
      tsCur = tsCur - dts;
    }

    return _.sortBy(tss);
  } else {
    throw '[HISTORY ANALYZER] У одного из заданий ts2 < ts1 или ts1 = ts2  ';
  }
};

// GET TTS ARRAY FROM A DATA SUBSET
const getActualTSs = subset => {
  const tss = subset.map(v => v.ts);
  // console.table({
  //   subsetTScount: tss.length,
  //    uniqueTSscount_: _.uniq(tss).length
  // })
  const uniqueTss = _.uniq(tss);
  const duplicates = _.filter(tss, (value, index, iteratee) =>
    _.includes(iteratee, value, index + 1)
  );
  const isAllUnique = duplicates.length === 0 ? true : false;

  // console.log(`subsetTScount= ${tss.length}; uniqueTsscount = ${uniqueTss.length}; duplicates = ${isAllUnique ? 'none' : duplicates}`);

  if (isAllUnique) {
    return tss;
  } else {
    console.log(
      `[HISTORY ANALYZER] Warning = ${duplicates.join(
        ', '
      )} were met several times in the subset`
    );
    return uniqueTss;

    // throw '[HISTORY ANALYZER] TSs of some subset are not unique'
  }
};

// pick N first and N last tss and OUT a string
const firstLastN = (arr, N) =>
  [_.take(arr, N).join(', '), _.takeRight(arr, N).join(', ')].join(' ... ');

//
//
//

// формат запроса
//  [
//    {
//       "1": [[ts1, ts2, dts], [ts3, ts4, dts]]
//    },
//    {
//       "2": [[ts1, ts2, dts], [ts3, ts4, dts]]
//    }
//  ];
