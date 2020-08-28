// pump - read gpx from directory, parse, calc a few things, return records
let fs = require('fs');
let path = require('path');
let gpxParser = require('gpxparser');
let convert = require('convert-units');
let moment = require('moment');

let parser;

const parse = (filePath) => {
  parser = new gpxParser();
  parser.parse(fs.readFileSync(filePath), {
    encoding: 'utf8',
    flag: 'r'
  }); //parse gpx file from string data

  let r = {};

  r.totalDistanceMeters = parser.tracks[0].distance.total; // IN METERS!!

  // convert to miles
  r.totalDistanceMiles = convert(r.totalDistanceMeters).from('m').to('mi');

  // console.log(`first point is ${JSON.stringify(parser.tracks[0].points[0])}`);
  // console.log(`points.length is ${JSON.stringify(parser.tracks[0].points.length)}`);
  // console.log(`last point is ${JSON.stringify(parser.tracks[0].points[parser.tracks[0].points.length - 1])}`);

  r.firstPointTime = moment(parser.tracks[0].points[0].time);
  r.lastPointTime = moment(parser.tracks[0].points[parser.tracks[0].points.length - 1].time);
  // console.log(`first point time is ${JSON.stringify(parser.tracks[0].points[0].time)}`);
  // console.log(`last point time is ${JSON.stringify(parser.tracks[0].points[parser.tracks[0].points.length - 1].time)}`);

  // all trails call this total time as opposed to moving time which is typically smaller
  // let duration = moment.utc(moment(lastPointTime).diff(moment(firstPointTime))).format("HH:mm:ss")
  let duration = moment.duration(r.lastPointTime.diff(r.firstPointTime));
  r.durMinutes = duration.asMinutes();

  // AllTrails would use moving time for this pace and not total time
  r.paceMinPerMiles = r.durMinutes / r.totalDistanceMiles;
  return r;
};

// (source directory for gpx files)
const importGpx = (gpxSourceDir) => {
  // read all gpx files from source directory
  const files = fs.readdirSync(gpxSourceDir).filter(filename => filename.match(/.*\.(gpx)/ig));
  console.log(`IMPORTING ${files.length} gpx files from ${gpxSourceDir}`);

  return files.map((file, index) => {
    console.log(`import- ${index + 1}/${files.length}`)
    return parse(path.join(gpxSourceDir, file));
  });
};

exports.importGpx = importGpx;
