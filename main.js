let appRoot = require('app-root-path');
let { importGpx } = require(`${appRoot}/utils/import`);
let { computeStats } = require(`${appRoot}/utils/stats`);
let pull = require(`${appRoot}/utils/pull`);
let { putToDynamo } = require(`${appRoot}/utils/put`);
let { purgeRecordings } = require(`${appRoot}/utils/purge`);
let { testIt } = require(`${appRoot}/utils/test`);
let { consolidate, transformRaw, transformConsolidated } = require(`${appRoot}/utils/transform`);

const gpxSourceDir = `${appRoot}/gpx/exports`;
const dbTableName = 'hike';

// purge
(async () => {

    // testIt();
    // return;
    

    // PURGE
    await purgeRecordings(dbTableName);

    // IMPORT
    // convert a folder of gpx files into an array of records with some extra spice
    // (source directory, import points, limit to a few records for testing)
    let gpxRecords = importGpx(gpxSourceDir);
    // let gpxRecords = importGpx(gpxSourceDir, false, 12);
    // let gpxRecords = await importGpx(gpxSourceDir, false, 2);
    console.log(`${gpxRecords.length} recs imported`);
    // console.log(`********imported****** - ${JSON.stringify(gpxRecords, null, 2)}`);

    // TRANSFORM RAW
    // transform raw recordings
    let transformedRawRecords = await transformRaw(gpxRecords);
    // console.log(`********transformed****** - ${JSON.stringify(gpxRecords, null, 2)}`);

    // PUT RAW TRANSFORMED
    await putToDynamo(dbTableName, transformedRawRecords);

    // CONSOLIDATE
    // consolidate collpases multiple hikes from the same day
    // so you get combined stats but still maintain the points for each day
    let consolidatedGpxRecords = await consolidate(dbTableName, gpxRecords);

    // TRANSFORM CONSOLIDATED
    let consolidatedTransformedGpxRecords = await transformConsolidated(consolidatedGpxRecords);

    // push consolidated to dynamodb
    await putToDynamo(dbTableName, consolidatedTransformedGpxRecords);

    // computeStats(dbTableName); // if you are not using the in-memory dataset you better await
    // await computeStats(dbTableName, gpxRecords);

    // pull.pull();
})().catch(e => {
    // Deal with the fact the chain failed
    console.error(`got an error yo - ${e}`);
});
