let appRoot = require('app-root-path');
let import = require(`${appRoot}/utils/import`);
let stats = require(`${appRoot}/utils/stats`);
let pull = require(`${appRoot}/utils/pull`);

// pump.pump();
// stats.stats();
pull.pull();
