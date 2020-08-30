let appRoot = require('app-root-path');
let { importGpx } = require(`${appRoot}/utils/import`);
let { computeStats } = require(`${appRoot}/utils/stats`);
let pull = require(`${appRoot}/utils/pull`);
let { putToDynamo } = require(`${appRoot}/utils/put`);
let { purgeTable } = require(`${appRoot}/utils/purge`);

const gpxSourceDir = `${appRoot}/gpx/exports`;
const dbTableName = 'hike';

// purge
purgeTable(dbTableName);

// convert a folder of gpx files into an array of records with some extra spice
// let gpxRecords = importGpx(gpxSourceDir);
let gpxRecords = importGpx(gpxSourceDir, 2, false);
console.log(`${gpxRecords.length} recs imported`);


// push them to dynamodb
putToDynamo(dbTableName, gpxRecords);

computeStats(dbTableName);
// computeStats(dbTableName, gpxRecords);

// pull.pull();
