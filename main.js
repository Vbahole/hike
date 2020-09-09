let appRoot = require('app-root-path');
let { importGpx } = require(`${appRoot}/utils/import`);
let { importATmap } = require(`${appRoot}/utils/import-at-map`);
let { computeStats } = require(`${appRoot}/utils/stats`);
let pull = require(`${appRoot}/utils/pull`);
let { putToDynamo } = require(`${appRoot}/utils/put`);
let { purgeItems } = require(`${appRoot}/utils/purge`);
let { testIt } = require(`${appRoot}/utils/test`);
let { consolidate, transformRaw, transformConsolidated } = require(`${appRoot}/utils/transform`);

const gpxSourceDir = `${appRoot}/gpx/exports`;
const atmapSourceFile = `${appRoot}/stubs/at-track-medium.json`;
const dbTableName = 'hike';

// purge
(async () => {

    // testIt();
    // return;

    let mapsObject = importATmap(atmapSourceFile);
    // console.log(`got a mapsObject - ${ mapsObject }`);
    // console.dir(mapsObject);
    return;

    // PURGE
    await purgeItems(dbTableName, 'recording');
    await purgeItems(dbTableName, 'consolidate');

    // IMPORT
    // convert a folder of gpx files into an array of records with some extra spice
    // (source directory, import points, limit to a few records for testing)
    // let gpxRecords = importGpx(gpxSourceDir);
    let gpxRecords = importGpx(gpxSourceDir, false, 12);
    // let gpxRecords = await importGpx(gpxSourceDir, false, 2);
    console.log(`${gpxRecords.length} recs imported`);
    // console.log(`********imported****** - ${JSON.stringify(gpxRecords, null, 2)}`);

    // TRANSFORM RAW - convert datestamps to strings to make dynamo happy
    let transformedRawRecords = await transformRaw(gpxRecords);
    // console.log(`********transformed****** - ${JSON.stringify(gpxRecords, null, 2)}`);

    // PUT RAW TRANSFORMED - key is 'recordings', range is datetime stamp
    await putToDynamo(dbTableName, transformedRawRecords);

    // CONSOLIDATE
    // consolidate collpases multiple hikes from the same day
    // combined stats, points array for each day
    let consolidatedGpxRecords = await consolidate(dbTableName, gpxRecords);

    // TRANSFORM CONSOLIDATED - convert datestamps to strings, reduce date to format 6/2/20
    let consolidatedTransformedGpxRecords = await transformConsolidated(consolidatedGpxRecords);

    // push consolidated to dynamodb - key is 'consolidate', range is date only like 6/20/20
    await putToDynamo(dbTableName, consolidatedTransformedGpxRecords);

    // computeStats(dbTableName); // if you are not using the in-memory dataset you better await
    // can't think of a reason we would use transformed over consolidated for stats
    await computeStats(dbTableName, consolidatedTransformedGpxRecords);

    // pull.pull();
})().catch(e => {
    // Deal with the fact the chain failed
    console.error(`got an error yo - ${e}`);
});
