import Dexie from 'dexie';
import _ from 'lodash';
import log from 'electron-log';
log.variables.label = 'MW';
const crypto = require('crypto');


let db = new Dexie('osm');

export const clearDataDB = () => {
  db.data.clear()
    .then(() => log.info('[DB] Data has been cleared'))
    .catch(err => log.error(err))
}

// export const destroyDB = () => {
//   db.schema.clear();
// };

export const declareDB = () => {
  db.version(1).stores({
    data: '&[ts+obj], [obj+ts], obj, ts, msg',
    schema: '&N, jsonSchema '
  });
  db.open().catch(err => {
    console.error(`Failed to open db ${err.stack || err}`);
  });
};

//
export const thinDB = spanSecs => {
  return db.transaction('rw', db.data, async () => {
    // 1) Pick all uniq tss for records that don't have any message attaached
    const abundantPKs = await db.data.where({ msg: [] }).primaryKeys();
    const abundantTss = _.sortBy(_.uniq(_.map(abundantPKs, pk => pk[0])));
    // console.log(stillTSs);

    // 2) Move with jumping spanSecs window from endTS to startTS and return only the maximum ts in each window if available

    let keepTss = [];
    let spanEndTs = _.max(abundantTss);
    let spanStartTs = spanEndTs - spanSecs;

    // console.log(spanStartTs, spanEndTs);
    // console.log(abundantTss);

    while (spanStartTs >= _.min(abundantTss)) {
      // take all between spanStart and spanEnd, and push their max to tsssKeep
      const subset = _.filter(
        abundantTss,
        ts => ts <= spanEndTs && ts > spanStartTs
      );

      if (subset.length > 0) {
        keepTss.push(_.max(subset));
      }

      spanEndTs = spanEndTs - spanSecs;
      spanStartTs = spanEndTs - spanSecs;
    }

    // 3) Purge what's not to keep
    const purgeTss = _.difference(abundantTss, keepTss);
    const purgePKs = _.filter(abundantPKs, pk => _.includes(purgeTss, pk[0]));

    return db.data.bulkDelete(purgePKs);
  });
};

export const writeSchemaToDB = jsonSchema => {
  return (
    db.schema
      .put({
        N: 1,
        jsonSchema: jsonSchema
      })
      // .then(res => console.log(res))
      .catch(err => {
        console.error(`Failed to put schema into db ${err.stack || err}`);
      })
  );
};

export const compareSchemas = (jsonOne, jsonTwo) => _.isEqual(jsonOne, jsonTwo);

// 1 = id of schema
export const readSchemaFromDB = () => {
  return db.schema.get(1).then(res => res.jsonSchema);
};

// input => dataArr
// Will overwrite existing records having the same PKs and return a hash of the written array
export const writeDataToDB = dataArr => {

  const incomingPKs = outPKs(dataArr); // primary keys of incoming data slices
  
  return db.data.bulkPut(dataArr)
    .then(() => {
      log.silly(
        `[DB] Data was successfully put to IDB, ${incomingPKs.length} slices were put`
      );
      return incomingPKs;
    })
    .catch(Dexie.BulkError, err => {
      console.error(
        `${err.failures.length} items were not added successfully`
      );
    })
}

// export const writeDataToDB = dataArr => {
//   return db.transaction('rw', db.data, async () => {
//     //
//     // FILTER OUT REPEATS
//     //

//     // find out which objects are incomming and filter records by those objects
//     const objsArr = outObjIDs(dataArr);
//     const incomingPKs = outPKs(dataArr); // primary keys of incoming data slices
//     const dbPKs = await db.data
//       .where('[ts+obj]') // primary keys existing in db
//       .anyOf(incomingPKs)
//       .primaryKeys(); // get all matching [obj+ts]
//     // .then(res=> console.log(res)) // [ [ts, obj], [ts, obj] .. [ts, obj]]
//     const repeatedPKs = _.intersectionWith(dbPKs, incomingPKs, _.isEqual); // primary keys we should not add
//     const missingPKs = _.differenceWith(incomingPKs, repeatedPKs, _.isEqual); // should add
//     // console.log('incoming', incomingPKs);
//     // console.log('db pk', dbPKs);
//     // console.log('repeated', repeatedPKs);
//     // console.log('missing', missingPKs);
//     // console.log('incoming', incomingPKs.length);
//     // console.log('available', dbPKs.length);
//     // console.log('repeatedPKs', repeatedPKs.length);
//     // console.log('will add', missingPKs.length);
//     const dataToWrite = filterSlices(missingPKs, dataArr); // data we will write to db
//     // console.log('what to write',dataToWrite);
//     if (repeatedPKs.length > 0) {
//       console.log(
//         `%c[DB] Will not write ${repeatedPKs.length} slices`,
//         'color: purple'
//       );
//     }

//     //
//     // WRITE
//     //

//     // write only if have smth to write
//     if (missingPKs.length > 0) {
//       return db.data
//         .bulkAdd(dataToWrite)
//         .then(() => {
//           console.log(
//             `%c[DB] Have written ${missingPKs.length} slices`,
//             'color: purple'
//           );
//           return missingPKs;
//         }) // make transaction return all written PKs
//         .catch(Dexie.BulkError, err => {
//           console.error(
//             `${err.failures.length} items were not added successfully`
//           );
//         });
//     } else {
//       return null;
//     }
//   });
// };

// objArr = [obj, obj, obj], tsRamge = [ts1, ts121]
// OUT [tss for obj 1, tss for obj 2 ... , tss for obj n]

export const readPKsByTSRanges = (objsArr, tsStrart, tsEnd) => {
  // console.log(tsStrart, tsEnd);
  return db.data
    .where('ts')
    .between(tsStrart, tsEnd, { includeLowers: true, includeUppers: true })
    .filter(d => _.includes(objsArr, d.obj))
    .primaryKeys(pks => pks)
    .catch(err => {
      console.error(
        `Failed to to get tss for objects ${objsArr.join(', ')}`,
        err
      );
    });
};

// objArr = [obj, obj, obj], tsRamges = [[ts1, ts121], [ts1333, ts16666], ...]
// OUT = datarr
export const readDataByTSRanges = (objsArr, tsRange) => {
  // console.log('Ts ranges coming',tsRange);

  return db.data
    .where('ts')
    .between(tsRange[0], tsRange[1], {
      includeLowers: true,
      includeUppers: true
    })
    .filter(d => _.includes(objsArr, d.obj))
    .toArray()
    .catch(err => {
      console.error(
        `Failed to to get data for objects ${objsArr.join(', ')}`,
        err
      );
    });
};

// IN [[ts, obj], [ts,obj] .. [ts, obj]] OUT [[tsmax, obj1], [tsmax, obj2] ... ]
export const freshestPKs = PKs => {
  const objIDs = _.uniq(PKs.map(pk => pk[1]));
  const res = objIDs.map(o => [
    _.max(
      _.filter(PKs, pk => pk[1] === o) // subset by object
        .map(pk => pk[0])
    ), // take obly tss and maximum
    o
  ]);

  // console.log(res);

  return res;
};

//  read
export const readByPKs = PKs => {
  return db.data
    .where('[ts+obj]')
    .anyOf(PKs)
    .toArray()
    .catch(err => {
      console.error(`Failed to read data for PKs ${PKs.join(', ')}`);
    });
};

//
// HELPERS
//

//OUT => [obj, obj, ... obj]
export const outObjIDs = dataArr => _.sortedUniq(dataArr.map(d => d.obj));

// OUT [ [ts, obj], [ts, obj] .. [ts, obj]] if flat=true => ['tsobj', '',]
export const outPKs = dataArr => dataArr.map(d => [d.ts, d.obj]);

// [ [ts, obj], [ts, obj] .. [ts, obj]]  => ['tsobj', '',]
// const flattenPKs = (pkArr) => (_.flatMap(pkArr, pk => pk.join('') ))

// IN [ [ts, obj], [ts, obj] .. [ts, obj]]  OUT [{data}, {data} ... {data}]
const filterSlices = (PKs, dataArr) =>
  PKs.map(pk => {
    const ts = pk[0];
    const obj = pk[1];

    return _.find(dataArr, d => d.ts === ts && d.obj === obj);
  });

// IN PK  [ [ts, obj], [ts, obj] .. [ts, obj]]  OUT [obj, obj, ... obj]
const pksToObjIDs = PKs => _.sortedUniq(PKs.map(pk => pk[1]));

// from many pks get timestamps for particular object
// in [ [ts, obj], [ts, obj] .. [ts, obj]], objID  OUT [ts, ts, ts]
export const filterTss = (PKs, objID) =>
  _.sortBy(_.filter(PKs, pk => pk[1] === objID).map(pk => pk[0]));
