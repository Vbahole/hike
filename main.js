let appRoot = require('app-root-path');
let { importGpx } = require(`${appRoot}/utils/import`);
let stats = require(`${appRoot}/utils/stats`);
let pull = require(`${appRoot}/utils/pull`);
let { putToDynamo } = require(`${appRoot}/utils/put`);

const gpxSourceDir = `${appRoot}/gpx/exports`;
const dbTableName = 'hike';

// convert a folder of gpx files into an array of records with some extra spice
let gpxRecords = importGpx(gpxSourceDir);
console.log(`${gpxRecords.length} recs imported`);

// push them to dynamodb
let putResult = putToDynamo(dbTableName, gpxRecords);
console.log(`put result - ${JSON.stringify(putResult, null, 2)}`);

// pump.pump();
// stats.stats();
// pull.pull();
