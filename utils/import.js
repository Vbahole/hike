// pump - read gpx from directory, parse, calc a few things, return records
let fs = require('fs');
let path = require('path');
let gpxParser = require('gpxparser');
let convert = require('convert-units');
let moment = require('moment');
let AWS = require("aws-sdk");

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});

// (destination dynamo table name, source directory for gpx files)
const importGpx = (dbTableName, gpxSourceDir) => {
  // read all gpx files from source directory
  let files = fs.readdirSync(gpxSourceDir).filter(function(e) {
    return e.match(/.*\.(gpx)/ig);
  });
  console.log('*pump*  '.repeat(10));
  console.log(`pumping ${files.length} gpx files into ${dbTableName} db from ${gpxSourceDir}`);

  // parse for total distance, delta for time, calc for pace
  let gpx = new gpxParser();
  files.forEach(function(file, index) {
    gpx.parse(fs.readFileSync(path.join(gpxSourceDir, file), {
      encoding: 'utf8',
      flag: 'r'
    })); //parse gpx file from string data

    let totalDistanceMeters = gpx.tracks[0].distance.total; // IN METERS!!

    // convert to miles
    let totalDistanceMiles = convert(totalDistanceMeters).from('m').to('mi');

    // console.log(`first point is ${JSON.stringify(gpx.tracks[0].points[0])}`);
    // console.log(`points.length is ${JSON.stringify(gpx.tracks[0].points.length)}`);
    // console.log(`last point is ${JSON.stringify(gpx.tracks[0].points[gpx.tracks[0].points.length - 1])}`);

    let firstPointTime = moment(gpx.tracks[0].points[0].time);
    let lastPointTime = moment(gpx.tracks[0].points[gpx.tracks[0].points.length - 1].time);
    // console.log(`first point time is ${JSON.stringify(gpx.tracks[0].points[0].time)}`);
    // console.log(`last point time is ${JSON.stringify(gpx.tracks[0].points[gpx.tracks[0].points.length - 1].time)}`);

    // all trails call this total time as opposed to moving time which is typically smaller
    // let duration = moment.utc(moment(lastPointTime).diff(moment(firstPointTime))).format("HH:mm:ss")
    let duration = moment.duration(lastPointTime.diff(firstPointTime));
    let durMinutes = duration.asMinutes();

    // AllTrails would use moving time for this pace and not total time
    let paceMinPerMiles = durMinutes / totalDistanceMiles;

    console.log(`pump - ${index + 1} of ${files.length}: ${firstPointTime} - ${file} - - ${durMinutes}`)
    // console.log(`gpx.tracks - ${JSON.stringify(gpx.tracks[0].points)}`)
    // AWS stuff
    let params = {
      TableName: dbTableName,
      Item: {
        'h': 'recording',
        'r': firstPointTime.toString(),
        'durationMinutes': durMinutes,
        'paceMinPerMile': paceMinPerMiles,
        'totalDistanceMiles': totalDistanceMiles,
        'points': gpx.tracks[0].points
      }
    };

    docClient.put(params, function(err, data) {
      if (err) {
        // console.log("DEBUG", (new Error().stack.split("at ")[1]).trim());
        console.log(`pump error - ${JSON.stringify(err)}`)
      } else {
        // console.log("Success", data);
      }
    });
  });
};

exports.importGpx = importGpx;
