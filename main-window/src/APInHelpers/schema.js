import _ from 'lodash';

// IN schema OUT [integer ids]
export const schemaObjIDs = schema => _.keys(schema.obj).map(k => parseInt(k));

// IN schema OUT all [obj types]
export const schemaAllObjectTypes = schema =>
  _.sortBy(_.uniq(_.values(_.mapValues(schema.obj, o => o.Type))), ['desc']);

export const schemaAllLines = schema =>
  _.castArray(_.mapValues(schema.lines, l => l.Name));

//FIXME:
export const schemaFirstLineID = schema => _.parseInt(_.keys(schema.lines)[0]);

// OUT rangeUD
export const schemaFirstRangeofLine = (schema, lineID) =>
  schema.lines[lineID].ranges[0];

export const schemaRangeObjects = (schema, rangeID) =>
  schema.ranges[rangeID].obj;

export const schemaRangeByObjectIds = (schema, objIDs) =>
  _.uniq(objIDs.map(o => schema.obj[o].parentRange)).join('');

export const schemaObjIDbyType = (schema, RangeID, Type) => {
  const rangeObjIDs = schema.ranges[RangeID].obj; // [1,2,3,4]
  return _.find(rangeObjIDs, o => schema.obj[o].Type == Type);
  // return _.find(_.filter(schema.obj, o => _.includes(objIDs, o)), o => o.Type === Type)[obj]
};

// (_.findKey(schema.obj, o => o.Type === Type));

export const schemaTypesbyObjIDs = (schema, objIDs) =>
  objIDs.map(o => schema.obj[o].Type);

// particular range object types
// IN schema, rangeID OUT [object types unique and sorted]
export const schemaRangeObjectTypes = (schema, rangeID) => {
  const objIDs = schema.ranges[rangeID].obj; // arr
  return _.sortBy(_.uniq(objIDs.map(o => schema.obj[o].Type)), ['asc']);
};

// IN schema, rangeID OUTline id
export const schemaLinebyRange = (schema, rangeID) =>
  schema.ranges[rangeID].parentLine;

// IN schema, towerID OUT => sensors on this tower, can be [empty] if no
export const schema_towerObjs = (schema, towerID) => {
  // check if nosensors
  if (!schema.towers[towerID].hasSensors) {
    return [];
  }

  // filter ranges with our tower
  const ranges = _.filter(schema.ranges, r => _.includes(r.towers, towerID));

  // console.log(`ranges that have tower ${towerID}`,ranges);

  // get all unique sensors for these ranges //FIXME::CAN CRUSH IF BOTH ENDPOINTS HAVE SENSORS
  const sensors = _.uniq(_.flatten(ranges.map(r => r.obj)));
  // console.log(`sensors for tower ${towerID}`, sensors);
  return sensors;
};

// IN unsorted objs OUT sorted objs
// export const schema_sortFresh = (schema, fresh) => {
//     return _.sortBy(fresh, f => f.)
// }

// obj = {
//     1: {Type: "A", sensorID: "-16-010", Fy: 10000, Fr: 15000, FRms: 200, Iy: 5, Ir: 10},
//     2: {Type: "B", sensorID: "-16-011", Fy: 10000, Fr: 15000, FRms: 200, Iy: 5, Ir: 10},
//     3: {Type: "C", sensorID: "-16-012", Fy: 10000, Fr: 15000, FRms: 200, Iy: 5, Ir: 10},
//     4: {Type: "ОКГТ", sensorID: "-07-007", Fy: 10000, Fr: 15000, FRms: 200, Iy: 5, Ir: 10},
//     5: {Type: "A", sensorID: "-16-013", Fy: 10000,
