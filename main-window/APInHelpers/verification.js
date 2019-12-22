import _ from 'lodash';
import { SCHEMA_1ST_LEVEL_NAMES, DATA_PROP_NAMES } from './base';
import log from 'electron-log';
const url = require('url');
log.variables.label = 'MW';

// check if schema is ok
// 1) schema is an {}
// 2) schema {} field name match those [ , , ,]
// 3) object, towers and so on IDS are unique
// 4) parent checking? not now

// IN json => OUT { }
export const verifySchema = schemaJson => {
  const schema = JSON.parse(schemaJson);

  if (typeof schema === 'object') {
    const firstLevelNamesMatch = SCHEMA_1ST_LEVEL_NAMES.every(n =>
      schema.hasOwnProperty(n)
    );

    if (firstLevelNamesMatch) {
      const entitiesHaveUniqueIDs = Object.keys(schema)
        .map(
          k1 =>
            Object.keys(schema[k1]).length ===
            _.sortedUniq(Object.keys(schema[k1])).length
        )
        .every(b => b === true);

      if (entitiesHaveUniqueIDs) {
        log.info('[Schema] FSchema verified ');
        return schema;
      } else {
        log.error('[Schema] Some entities IDS are not unique');
      }
    } else {
      log.error(
        `[Schema] First level names in schema do not match ${SCHEMA_1ST_LEVEL_NAMES.join(
          ', '
        )}`
      );
    }
  } else {
    log.error('[Schema] Schema is not an object');
  }
};

// check if fresh  is ok
// 1) fresh is an []
// 2) fresh [] is not empty
// 3) each fresh element is {}
// 4) each fresh {} has right field names and field type values (string/number) NOT YET
// input fresh, output fresh if passes or throw error

// IN json => OUT [ ]
export const verifyData = dataJSON => {
  const data = JSON.parse(dataJSON);
  // console.log('verification', dataJSON);

  if (Array.isArray(data)) {
    if (data.length > 0) {
      const allAreObjects = data.map(f => typeof f).every(f => f === 'object');

      if (allAreObjects) {
        const singledataPropNamesOk = data =>
          DATA_PROP_NAMES.map(pn => data.hasOwnProperty(pn));

        const allPropNamesAreOk = data.every(f => singledataPropNamesOk(f));

        if (allPropNamesAreOk) {
          // console.log('data verified');
          log.info('[Data] Fresh/history verified ');
          return data;
        } else {
          log.error('[Data] Some of the data have wrong propnames');
        }
      } else {
        log.error('[Data] Some of data are not objects');
      }
    } else {
      log.error('[Data] data is an empty array');
    }
  } else {
    log.error('[Data] data is not an array', data);
  }
};

//
