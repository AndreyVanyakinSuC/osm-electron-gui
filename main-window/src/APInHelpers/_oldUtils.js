import {median} from 'mathjs';
import flatten from 'lodash.flatten';
import uniq from 'lodash.uniq';
import difference from 'lodash.difference';
import moment from 'moment';
import equals from 'array-equal';
import downsampler from 'downsample-lttb';
const linear = require('everpolate').linear;
const intersect = require('path-intersection');
import {FSample, FminSample, FmaxSample} from './FxysSample';
import base from '../_oldbase' ;


// Get an array of Objects, create an object of objects
export const arrayToObject = (array, keyField) => array.reduce((obj, item) => {
    obj[item[keyField]] = item;
    return obj;
  }, {})


// receive data objects, return [x1,x2....xn], [y1,y2... yn], where x is default ts, and y is prop of chocie
export const deriveXYarr = (data, x , y) => {
    return [data.map(el => el[x]) , data.map(el => el[y])]
}

// get some Y value from array of data objects given a TS
export const deriveYatX = (data, yType, xValue) => {
    return data.filter(el => (el.ts === xValue)).map(el => el[yType]).join('')
}

// get maximum from N non-uniform charts TODO: refactor
// @input [[xarr,yarr] ,[xarr,yarr] ... [xarr,yarr]]
// @outpuy [xarr,yarr]
export const getMax = (xys) => {
        
    const everyX = uniq(flatten(xys.map(xy => xy[0])))

    // Are the arrays non-uniform? 
    const isUniform = (flatten(xys.map(xy => difference(xy[0], everyX))).length === 0) ? true : false

    // [[x1,y1], [x2,y2] ... [xn, yn]]
    let xy;

    if (isUniform) {
        xy = toXYarrs(everyX.map((x,i) => [x, Math.max(...xys.map(xy => xy[1][i]))]))
    } else {
        
        console.log('Go see the interpolation');
        // interpolate shit
        // TODO: WASNT TESTED APPROPRIATELY

        // 
        // const interpolated = xys.map(xy => linear( difference( xy[0], everyX) , xy[0] , xy[1] ) )
        
    }

    // dig down 
    
    return xy;
    // only interpolate if there's a need i.e. arrays are non uniform
}

// median y values for each ts, account for undefined values (nonuniform ts)~
export const getMedian = (xys) => {
    const everyX = uniq(flatten(xys.map(xy => xy[0])));
    const ys = everyX.map((x,i) => median(xys.map(xy => xy[1][i] === undefined ? null : xy[1][i])) )
    return  [everyX.map(x => x), everyX.map((x,i) => ys[i])]
}

// Receive [x1,x2 ... xn][ y1,y2....yn] , downsample, return in same format
export const downsample = (xy, pts) => {
    // console.log('hits downsample',xy);
    if (xy[0].length > pts) {
        
        const [x,y] = toXYarrs(downsampler.processData(toXYPairs(xy), pts));
        // console.log('downsample, many pts', [x.map(ts => format(ts)), y]);
        return [x.map(ts => format(ts)), y];
    } else {
        const [x,y] = xy;
        // console.log('downsample, low pts', [x.map(ts => format(ts)), y]);
        return [x.map(ts => format(ts)), y]
    }

}

// Receive [x1,x2 ... xn][ y1,y2....yn] , downsample, return [x1,x2 ... xn] [ y1-y1,y2-y1....yn-y1]
export const toNullXYarr = (xy) => {
    return [xy[0], xy[1].map(y => (y - xy[1][0]))]
}

// 2 UTIL
export const toXYPairs = (xyArrs) => {
    return xyArrs[0].map((x,i) => [x, xyArrs[1][i]])
}

export const toXYarrs = (xyPairs) => {
    // console.log('hits toXYarrs', xyPairs);
    return [flatten(xyPairs.map(pair => [pair[0]])), flatten(xyPairs.map(pair => [pair[1]]))]
}

export const format = (ts) => {
    return ts*1000 /*moment.unix(ts).format('YYYY-MM-DD_HH:mm:ss') */
}

// [ts, y] to SVG path
export const xyToPath = (xy) => (`M ${toXYPairs(xy).map(v => v.join(',')).join(' L ')} Z`)

// Create shape that depicts leaving thresholds in tension
export const tensionThreshViolationShape = (F, maxF, minF) => {
    // All args = [[x],[y]]

    const isViolatingMax = Math.max(...F[1]) > Math.max(...maxF[1]); 
    const isViolatingMin = Math.min(...F[1]) > Math.min(...minF[1]);
    const start = Math.min(F[0][0], maxF[0][0], minF[0][0]);
    const end = Math.max(F[0][F.length-1], maxF[0][maxF.length-1], minF[0][minF.length-1]);

    if (isViolatingMax) {

        // nonmathcing TSs
        const diffTSS = difference(F[0], maxF[0])
        // Calc F for each

        if (diffTSS.length > 0) {
            
            console.log('Interpolating');
            // non-uniform data, interpolate F and Fthresh  missing X-points,
            // filter stuff so indexes are correct

            F[1].push(linear(diffTSS, F[0], F[1]))
            F[0].push(diffTSS)
            F = toXYarrs(toXYPairs(F).sort((a,b) => {if (a[0] < b[0]) {return -1}}))

            maxF[1].push(linear(diffTSS, maxF[0], maxF[1]))
            maxF[0].push(diffTSS)
            maxF = toXYarrs(toXYPairs(maxF).sort((a,b) => {if (a[0] < b[0]) {return -1}}))
        } 

        // and get (F interpolated - F thresh)
        // [[ts1,ts2 ...tsn], [F1, F2 ... Fn]]  -   [[ts1,ts2 ...tsn], [Fmax1, Fmax2 ... Fmaxn]]
        const diff = [F[0], maxF[1].map((v,i) => (v - F[1][i]))]

        // get [ts,F] for each xsection point, sort in ascending order by ts

        let out;

        // Exception = we start and end higher than threshold( no xsection points)
        // if (!diff.includes(true)) {
        //     out =
        // }

        // Exception = we start higher than threshold
        if (diff[0][0] < 0) {
            
        }

        // Exception = we end higher than threshold
        if (diff[0][diff.length-1] < 0) {
            
        }


        console.log(diff[1]);

    } else {
        console.log('not violating');
    }
}

//  [false, false, true ... flase], true if sign changes after el
const findSignChange = (arr) => (arr.map((v,i,a) => {
    return ((v < 0 && a[i+1] > 0) || (v >0 && a[i+1] < 0)) ? true : false
}))

// [[TS1, F1], [TS2, F2]]  intersection point w [[TS1, Fmax1], [TS2, Fmax2]] returns [TSx, Fx]
const xsectLines = () => {

}

// get lines ids = [1,2,3] and make strings ints
export const getLinesArray = linesData => (Object.keys(linesData).map(s => parseInt(s)))

// define etiny types by schema input
export const defineEntitiesTypes = (schema) => {
    return uniq(Object.entries(schema.obj).map(kv => (kv[1].Type)))
}

// entities by rangeID
export const defineEntitiesAtRange = (schema, rangeID) => {
    return schema.ranges[rangeID].obj.map(objID => schema.obj[objID].Type)
}

// get first range of a line
export const defineFirstRangeOfLine = (schema, lineID) => {
    return schema.lines[lineID].ranges[0]
}

// [wire IDs] = f (schema, range ID, [entities])
export const defineWireIDsByRangeAndEntities = (objData, rangeID, entities) => {
    return Object.entries(objData).filter(v => {
            
        (entities.length === 0) ? console.log('No entities selected'): null;
        // console.log(v);

        //v[0] - obj ID
        // v[1] - {obj data}
        const objID = v[0];
        const objRange = v[1].parentRange;
        const objEntity = v[1].Type;

        // rangeID matches AND
        // object of only matching entities are included
        // console.log(`sRange = ${rangeID} oRange = ${objRange} entities = ${entities} oEnt = ${objEntity}`);

        return ((objRange === rangeID) && (entities.includes(objEntity))) ? true : false

    }).map(v => parseInt(v[0]));


    // Obj data
    // {
    //     1: {}.
    //     2: {},
    //     x: {}
    // }
}

// get Date object => return UNIX seconds timestamp
export const dateToUNIXsecs = (date) => (moment(date).unix())

// subtract x hours from Date object
export const subtractHours = (date, hours) => (moment(date).subtract(hours,`h`).toDate())

// check if schema is ok
// 1) schema is an {}
// 2) schema {} field name match those [ , , ,]
// 3) object, towers and so on IDS are unique
// 4) parent checking? not now
export const checkSchema = (schema) => {
    if (typeof(schema) === 'object') {

        const firstLevelNamesMatch = base.schemaFirstLevelNames.every(n => schema.hasOwnProperty(n));

        if (firstLevelNamesMatch) {

            const entitiesHaveUniqueIDs = Object.keys(schema)
                .map(k1 => (Object.keys(schema[k1]).length === uniq(Object.keys(schema[k1])).length))
                .every(b => (b === true))

            if (entitiesHaveUniqueIDs) {

                return schema;

            } else {
                throw `[SCHEMA CHECKER] Some entities IDS are not unique`
            }

        } else {
            throw `[SCHEMA CHECKER] First level names in schema do not match ${base.schemaFirstLevelNames.join(', ')}`
        }

    } else {
        throw '[SCHEMA CHECKER] Schema is not an object'
    }
}


// check if fresh  is ok
// 1) fresh is an []
// 2) fresh [] is not empty
// 3) each fresh element is {}
// 4) each fresh {} has right field names and field type values (string/number) NOT YET
// input fresh, output fresh if passes or throw error

export const checkFresh = (fresh) => {
    if (Array.isArray(fresh)) {

        if (fresh.length > 0) {


            const allAreObjects = fresh.map(f => typeof(f)).every(f => f === 'object');


            if (allAreObjects) {

                const singleFreshPropNamesOk = (fresh) => (
                    base.freshPropNames.map(pn => fresh.hasOwnProperty(pn))
                )

                const allPropNamesAreOk = fresh.every(f => (singleFreshPropNamesOk(f)))

                if (allPropNamesAreOk) {
                    
                    return  fresh;

                } else {
                    throw '[FRESH CHECKER] Some of the fresh have wrong propnames'
                }


            } else {
                throw '[FRESH CHECKER] Some of fresh are not objects'
            }

        } else {
            throw '[FRESH CHECKER] Fresh is an empty array'
        }
    } else {
        throw '[FRESH CHECKER] Fresh is not an array'
    }
}
