import _ from 'lodash';
import { SCHEMA_1ST_LEVEL_NAMES, DATA_PROP_NAMES } from './base';

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
        console.log('Schema verified');
        return schema;
      } else {
        throw `[SCHEMA CHECKER] Some entities IDS are not unique`;
      }
    } else {
      throw `[SCHEMA CHECKER] First level names in schema do not match ${SCHEMA_1ST_LEVEL_NAMES.join(
        ', '
      )}`;
    }
  } else {
    throw '[SCHEMA CHECKER] Schema is not an object';
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

  if (Array.isArray(data)) {
    if (data.length > 0) {
      const allAreObjects = data.map(f => typeof f).every(f => f === 'object');

      if (allAreObjects) {
        const singledataPropNamesOk = data =>
          DATA_PROP_NAMES.map(pn => data.hasOwnProperty(pn));

        const allPropNamesAreOk = data.every(f => singledataPropNamesOk(f));

        if (allPropNamesAreOk) {
          // console.log('data verified');
          return data;
        } else {
          throw '[data CHECKER] Some of the data have wrong propnames';
        }
      } else {
        throw '[data CHECKER] Some of data are not objects';
      }
    } else {
      throw '[data CHECKER] data is an empty array';
    }
  } else {
    throw '[data CHECKER] data is not an array';
  }
};

//
