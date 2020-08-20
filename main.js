let appRoot = require('app-root-path');
let pump = require(`${appRoot}/utils/pump`);
let stats = require(`${appRoot}/utils/stats`);
let pull = require(`${appRoot}/utils/pull`);

// pump.pump();
// stats.stats();
pull.pull();
