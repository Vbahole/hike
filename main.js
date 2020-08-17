let http = require('http');
let fs = require('fs');
let appRoot = require('app-root-path');
let gpxParser = require('gpxparser');
let convert = require('convert-units');
let moment = require('moment');
let AWS = require("aws-sdk");

AWS.config.update({region: 'us-east-1'});
var docClient = new AWS.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const dbTableName = 'Hike';

const sampleGPX = `${appRoot}/gpx/mock/Recording1.gpx`;


let gpx = new gpxParser(); //Create gpxParser Object
gpx.parse(fs.readFileSync(sampleGPX, {encoding:'utf8', flag:'r'})); //parse gpx file from string data
let totalDistanceMeters = gpx.tracks[0].distance.total; // IN METERS!!

// convert to miles
let totalDistanceMiles = convert(totalDistanceMeters).from('m').to('mi')

console.log(`metadata.name is ${JSON.stringify(gpx.metadata.name)}`);
// console.log(`tracks is ${JSON.stringify(gpx.tracks)}`);
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
    'RecordingDate' : firstPointTime.toString(),
    'Recording' : {
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
