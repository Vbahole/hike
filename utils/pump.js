let fs = require('fs');
let path = require('path');
let appRoot = require('app-root-path');
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
const dbTableName = 'hike';
const gpxExportsDir = `${appRoot}/gpx/exports`;

const pump = () => {
  let dirCont = fs.readdirSync(gpxExportsDir);
  let files = dirCont.filter(function(e) {
    return e.match(/.*\.(gpx)/ig);
  });
  console.log('*pump*  '.repeat(10));
  console.log(`starting pump for ${files.length} gpx files`);
  files.forEach(function(file, index) {
    let gpx = new gpxParser();
    let fullPath = path.join(gpxExportsDir, file);
    gpx.parse(fs.readFileSync(fullPath, {
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

    // again, AllTrails would use moving time for this pace and not total time
    let paceMinPerMiles = durMinutes / totalDistanceMiles;

    console.log(`${index + 1} of ${files.length}: ${firstPointTime} - ${file} - - ${durMinutes}`)

    // AWS stuff
    let params = {
      TableName: dbTableName,
      Item: {
        'h': 'recording',
        'r': firstPointTime.toString(),
        'track': {
          'points': gpx.tracks[0].points,
          'durationMinutes': durMinutes,
          'paceMinPerMile': paceMinPerMiles,
          'totalDistanceMiles': totalDistanceMiles
        }
      }
    };

    docClient.put(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        // console.log("Success", data);
      }
    });
  });
};

exports.pump = pump;
