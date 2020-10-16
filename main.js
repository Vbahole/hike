let appRoot = require('app-root-path');
let { importATmap } = require(`${appRoot}/utils/import-at-map`);
let { computeStatsATMap } = require(`${appRoot}/utils/stats-at-map`);
let pull = require(`${appRoot}/utils/pull`);
let { putToDynamo } = require(`${appRoot}/utils/put`);
let { purgeItems } = require(`${appRoot}/utils/purge`);
let { testIt } = require(`${appRoot}/utils/test`);
let { transformATMAp } = require(`${appRoot}/utils/transform`);

const atmapSourceFile = `${appRoot}/stubs/at-track-medium.json`; // json at-map response
const dbTableName = 'hike';

(async () => {

  // testIt();
  // return;

  // PURGE
  await purgeItems(dbTableName, 'recording');
  await purgeItems(dbTableName, 'consolidate');
  await purgeItems(dbTableName, 'at-map-medium');
  await purgeItems(dbTableName, 'stat');

  // IMPORT - place an all trails export at stubs/at-track-medium.json
  let mapsObject = importATmap(atmapSourceFile);

  // TRANSFORM - modify/select fields
  let transformedATMapRecords = await transformATMAp(mapsObject);

  // STATS
  await computeStatsATMap(dbTableName, transformedATMapRecords);
  return;

  // PUT
  await putToDynamo(dbTableName, transformedRawRecords);

})().catch(e => {
  console.error(`HEY - got an error yo - ${e}`);
});
