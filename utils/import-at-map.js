// pump - read at-map api endpoint results from file, return records
let fs = require('fs');
let path = require('path');

// (source directory for at-map endpoint json file, limit to n recs to speed up dev)
const importATmap = (atmapSourceFile, importPoints = true, limit) => {
  // TODO:: get limit in the mix
  console.info(`atmapSourceFile - ${atmapSourceFile}`);
  const m = fs.readFileSync(atmapSourceFile);
  const mapsObject = JSON.parse(m);
  console.log(`IMPORTING ${mapsObject.maps.length} map records from at-map at ${atmapSourceFile}`);
  return mapsObject.maps;
};

exports.importATmap = importATmap;
