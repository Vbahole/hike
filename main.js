let appRoot = require('app-root-path');
let { importGpx } = require(`${appRoot}/utils/import`);
let stats = require(`${appRoot}/utils/stats`);
let pull = require(`${appRoot}/utils/pull`);
let { putToDynamo } = require(`${appRoot}/utils/put`);

const gpxSourceDir = `${appRoot}/gpx/exports`;
const dbTableName = 'hike';

// convert a folder of gpx files into an array of records with some extra spice
let gpxRecords = importGpx(gpxSourceDir);
console.log(`recs ${JSON.stringify(gpxRecords, null, 2)}`);
// push them to dynamodb
//let putResult = putToDynamo(dbTableName, records);

// pump.pump();
// stats.stats();
// pull.pull();
