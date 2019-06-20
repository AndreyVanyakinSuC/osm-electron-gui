import _ from 'lodash';

// IN schema  schema.lines.id.latlng = [[lat,lon],[lat,lon]...]
// OUT [lat, lat, lat] and [lon, lon, lon] from all lines in schema
const geo_allLatLon = (schema) => {

    // console.log(_.map(schema.lines, l => l.latlng));
    const allLatLngs = _.flatten(_.map(schema.lines, l => l.latlng));
    // join, break to lat and lng arrays
    return [allLatLngs.map(ll => (ll[0])), allLatLngs.map(ll => (ll[1]))];
}

// IN [[lat,lat,lat],[lon, lon, lon]]
// OUT bounds [[lat,lon], [lat.lon]]
export const geo_globalBounds = (schema) => {
    const [lats, lons] = geo_allLatLon(schema);
    const res = [
        [_.min(lats), _.min(lons)],
        [_.max(lats), _.max(lons)]
    ]

    // console.log(res);
    return res;
}

// IN [[lat,lat,lat],[lon, lon, lon]]
// OUT center [lat,lon]
export const geo_Center = (schema) => {
    const allLatLngs = geo_allLatLon(schema);
    
    return [
        (_.min(allLatLngs[0]) + _.max(allLatLngs[0])) / 2,
        (_.min(allLatLngs[1]) + _.max(allLatLngs[1])) / 2
    ]
}

// Define which range is before and which is after this tower ID for popup
// IN (towerID, schema) OUT {fromRange: rangeID, towardsRange: rangeID}

export const geo_towerRanges = (schema, towerID) => {

    // 1) get an array of rangeIDs which include towerID
    const rangeIDs = _.filter(_.keys(schema.ranges), rID => _.includes(schema.ranges[rID].towers, towerID))

    return _.pick(schema.ranges, rangeIDs);
}

const findPeerTowerID = (towerIDsArr, towerID) => (_.find(towerIDsArr, twrID => twrID !== towerID))

// position either 'towards' or 'from'
export const geo_pickRange = (adjacentRanges, towerID, position) => {
    return _.find(adjacentRanges, rangeObj => {
        
        const peerTowerID = findPeerTowerID(rangeObj.towers, towerID)
        
        if (position === 'from') {
            return peerTowerID < towerID;
        } else if (position === 'towards') {
            return peerTowerID > towerID;
        } else {
            console.error(`Position is neither 'from' nor 'towards'`);
        }
    })
}

// OUT tower object
export const geo_adjacentTowerObject = (rangeObj, towerID, schema) => {
    const peerTowerID = findPeerTowerID(rangeObj.towers, towerID);
    return schema.towers[peerTowerID];
}