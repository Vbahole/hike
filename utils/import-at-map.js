const fs = require('fs')

const importATmap = (atmapSourceFile, limit) => {
  const mapsObject = JSON.parse(fs.readFileSync(atmapSourceFile))
  console.log(`IMPORTING ${mapsObject.maps.length} map records from at-map at ${atmapSourceFile}`)
  return mapsObject.maps
}

exports.importATmap = importATmap
