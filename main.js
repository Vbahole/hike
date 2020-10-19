const appRoot = require('app-root-path')
const { importATmap } = require(`${appRoot}/utils/import-at-map`)
const { computeStatsATMap } = require(`${appRoot}/utils/stats-at-map`)
// const pull = require(`${appRoot}/utils/pull`)
const { putToDynamo } = require(`${appRoot}/utils/put`)
const { purgeItems } = require(`${appRoot}/utils/purge`)
// const { testIt } = require(`${appRoot}/utils/test`)
const { transformATMAp } = require(`${appRoot}/utils/transform`)

const atmapSourceFile = `${appRoot}/stubs/at-track-medium.json` // json at-map response
const dbTableName = 'hike'

(async () => {
  // testIt()
  // return
  // PURGE
  await purgeItems(dbTableName, 'recording')
  await purgeItems(dbTableName, 'consolidate')
  await purgeItems(dbTableName, 'at-map-medium')
  await purgeItems(dbTableName, 'stat')

  // IMPORT - place an all trails export at stubs/at-track-medium.json
  const mapsObject = importATmap(atmapSourceFile)

  // TRANSFORM - modify/select fields
  const transformedATMapRecords = await transformATMAp(mapsObject)

  // STATS
  await computeStatsATMap(dbTableName, transformedATMapRecords)

  // PUT
  await putToDynamo(dbTableName, transformedATMapRecords)
})().catch(e => {
  console.error(`HEY - got an error yo - ${e}`)
})
