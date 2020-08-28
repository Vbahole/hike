// pump - read gpx from directory, parse, calc a few things, return records
let fs = require('fs');
let path = require('path');
let gpxParser = require('gpxparser');
let convert = require('convert-units');
let moment = require('moment');

let parser;

// (source directory for gpx files)
const importGpx = (gpxSourceDir) => {

  // read all gpx files from source directory
  const files = fs.readdirSync(gpxSourceDir).filter(filename => filename.match(/.*\.(gpx)/ig));
  console.log(`IMPORTING ${files.length} gpx files into ${dbTableName} db from ${gpxSourceDir}`);

  return files.map((file, index) => {
      parser = new gpxParser();
      parser.parse(fs.readFileSync(path.join(gpxSourceDir, file), {
        encoding: 'utf8',
        flag: 'r'
      })); //parse gpx file from string data

      let totalDistanceMeters = parser.tracks[0].distance.total; // IN METERS!!

      // convert to miles
      let totalDistanceMiles = convert(totalDistanceMeters).from('m').to('mi');

      // console.log(`first point is ${JSON.stringify(parser.tracks[0].points[0])}`);
      // console.log(`points.length is ${JSON.stringify(parser.tracks[0].points.length)}`);
      // console.log(`last point is ${JSON.stringify(parser.tracks[0].points[parser.tracks[0].points.length - 1])}`);

      let firstPointTime = moment(parser.tracks[0].points[0].time);
      let lastPointTime = moment(parser.tracks[0].points[parser.tracks[0].points.length - 1].time);
      // console.log(`first point time is ${JSON.stringify(parser.tracks[0].points[0].time)}`);
      // console.log(`last point time is ${JSON.stringify(parser.tracks[0].points[parser.tracks[0].points.length - 1].time)}`);

      // all trails call this total time as opposed to moving time which is typically smaller
      // let duration = moment.utc(moment(lastPointTime).diff(moment(firstPointTime))).format("HH:mm:ss")
      let duration = moment.duration(lastPointTime.diff(firstPointTime));
      let durMinutes = duration.asMinutes();

      // AllTrails would use moving time for this pace and not total time
      let paceMinPerMiles = durMinutes / totalDistanceMiles;

      console.log(`import- ${index + 1}/${files.length}: ${firstPointTime} - ${file} - - ${durMinutes}`)
    });
};

exports.importGpx = importGpx;
