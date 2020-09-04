let appRoot = require('app-root-path');
let { importGpx } = require(`${appRoot}/utils/import`);
let { computeStats } = require(`${appRoot}/utils/stats`);
let pull = require(`${appRoot}/utils/pull`);
let { putToDynamo } = require(`${appRoot}/utils/put`);
let { purgeRecordings } = require(`${appRoot}/utils/purge`);
let { testIt } = require(`${appRoot}/utils/test`);
let { consolidate, transformRaw } = require(`${appRoot}/utils/transform`);

const gpxSourceDir = `${appRoot}/gpx/exports`;
const dbTableName = 'hike';

// purge
(async () => {

    // testIt();
    // return;

    await purgeRecordings(dbTableName);

    // convert a folder of gpx files into an array of records with some extra spice
    // (source directory, import points, limit to a few records for testing)
    // let gpxRecords = importGpx(gpxSourceDir);
    let gpxRecords = await importGpx(gpxSourceDir, false, 2);
    console.log(`${gpxRecords.length} recs imported`);
    // console.log(`********imported****** - ${JSON.stringify(gpxRecords, null, 2)}`);

    // push raw recordings
    let transformedRecords = await transformRaw(gpxRecords);
    // console.log(`********transformed****** - ${JSON.stringify(gpxRecords, null, 2)}`);

    await putToDynamo(dbTableName, transformedRecords);

    // transform the recordings before they go into dynamodb
    // consolidate collpases multiple hikes from the same day
    // so you get combined stats but still maintain the points for each day
    // gpxRecords = await consolidate(dbTableName, gpxRecords);

    // push consolidated to dynamodb
    // await putToDynamo(dbTableName, gpxRecords);

    // computeStats(dbTableName); // if you are not using the in-memory dataset you better await
    // await computeStats(dbTableName, gpxRecords);

    // pull.pull();
})().catch(e => {
    // Deal with the fact the chain failed
    console.error(`got an error yo - ${e}`);
});
