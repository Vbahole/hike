let http = require('http');
let fs = require('fs');
let path = require('path');
let appRoot = require('app-root-path');
let gpxParser = require('gpxparser');
let convert = require('convert-units');
let moment = require('moment');
const { uuid } = require('uuidv4');
let AWS = require("aws-sdk");


// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});
const dbTableName = 'Hike';

// gpxParser
const sampleGPX = `${appRoot}/gpx/mock/Recording1.gpx`;
const gpxExportsDir = `${appRoot}/gpx/exports`;


let dirCont = fs.readdirSync(gpxExportsDir);
let files = dirCont.filter(function(e) {
  return e.match(/.*\.(gpx)/ig);
});
console.log(`files count - ${files.length}`);
files.forEach(function(file, index) {
  let gpx = new gpxParser();
  let fullPath = path.join(gpxExportsDir, file);

  console.log(`THE fullPath ----- ${fullPath}`)
  gpx.parse(fs.readFileSync(fullPath, {
    encoding: 'utf8',
    flag: 'r'
  })); //parse gpx file from string data
  let totalDistanceMeters = gpx.tracks[0].distance.total; // IN METERS!!

  // convert to miles
  let totalDistanceMiles = convert(totalDistanceMeters).from('m').to('mi');

  console.log(`first point is ${JSON.stringify(gpx.tracks[0].points[0])}`);
  console.log(`points.length is ${JSON.stringify(gpx.tracks[0].points.length)}`);
  console.log(`last point is ${JSON.stringify(gpx.tracks[0].points[gpx.tracks[0].points.length - 1])}`);

  let firstPointTime = moment(gpx.tracks[0].points[0].time);
  let lastPointTime = moment(gpx.tracks[0].points[gpx.tracks[0].points.length - 1].time);
  console.log(`first point time is ${JSON.stringify(gpx.tracks[0].points[0].time)}`);
  console.log(`last point time is ${JSON.stringify(gpx.tracks[0].points[gpx.tracks[0].points.length - 1].time)}`);

  // all trails call this total time as opposed to moving time which is typically smaller
  // let duration = moment.utc(moment(lastPointTime).diff(moment(firstPointTime))).format("HH:mm:ss")
  var duration = moment.duration(lastPointTime.diff(firstPointTime));
  var durMinutes = duration.asMinutes();
  console.log(`durMinutes - ${durMinutes}`);

  // again, AllTrails would use moving time for this pace and not total time
  let paceMinPerMiles = durMinutes / totalDistanceMiles;

  // AWS stuff
  var params = {
    TableName: dbTableName,
    Item: {
      'RecordingId': uuid(),
      'RecordingDate': firstPointTime.toString(),
      'Recording': {
        'points': gpx.tracks[0].points,
        'durationMinutes': durMinutes,
        'paceMinPerMile': paceMinPerMiles
      }
    }
  };

  // Call DynamoDB to add the item to the table
  docClient.put(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data);
    }
  });
});
