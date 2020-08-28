let appRoot = require('app-root-path');
let { importGpx } = require(`${appRoot}/utils/import`);
let stats = require(`${appRoot}/utils/stats`);
let pull = require(`${appRoot}/utils/pull`);
let put = require(`${appRoot}/utils/put`);

const gpxSourceDir = `${appRoot}/gpx/exports`;

let gpxRecords = importGpx(gpxSourceDir);
console.log(`got em ${gpxRecords.length}`);
// pump.pump();
// stats.stats();
// pull.pull();
