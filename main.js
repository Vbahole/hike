let appRoot = require('app-root-path');
let pump = require(`${appRoot}/utils/pump`);
let stats = require(`${appRoot}/utils/stats`);

console.log(` hike application `);
// pump.pump();
stats.stats();
