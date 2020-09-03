let appRoot = require('app-root-path');
let { importGpx } = require(`${appRoot}/utils/import`);
let { computeStats } = require(`${appRoot}/utils/stats`);
let pull = require(`${appRoot}/utils/pull`);
let { putToDynamo } = require(`${appRoot}/utils/put`);
let { purgeTable } = require(`${appRoot}/utils/purge`);
let { testIt } = require(`${appRoot}/utils/test`);
let { consolidate } = require(`${appRoot}/utils/transform`);

const gpxSourceDir = `${appRoot}/gpx/exports`;
const dbTableName = 'hike';

// purge
(async () => {

    // testIt();
    await purgeTable(dbTableName);

    // convert a folder of gpx files into an array of records with some extra spice
    // (source directory, import points, limit to a few records for testing)
    // let gpxRecords = importGpx(gpxSourceDir);
    let gpxRecords = importGpx(gpxSourceDir, false, 10);
    console.log(`${gpxRecords.length} recs imported`);

    // transform the recordings before they go into dynamodb
    // consolidate collpases multiple hikes from the same day
    // so you get combined stats but still maintain the points for each day
    gpxRecords = await consolidate(dbTableName, gpxRecords);

    // push them to dynamodb
    putToDynamo(dbTableName, gpxRecords);

    // computeStats(dbTableName); // if you are not using the in-memory dataset you better await
    computeStats(dbTableName, gpxRecords);

    // pull.pull();
})().catch(e => {
    // Deal with the fact the chain failed
    console.error(`got an error yo - ${e}`);
});
