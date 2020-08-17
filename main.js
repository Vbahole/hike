let http = require('http');
let fs = require('fs');
let appRoot = require('app-root-path');
let distance = require('gps-distance');
let gpxParser = require('gpxparser');
let convert = require('convert-units');
let moment = require('moment');

const sampleGPX = `${appRoot}/gpx/Recording1.gpx`;

http.createServer(function (request, response) {
   // Send the HTTP header
   // HTTP Status: 200 : OK
   // Content Type: text/plain
   response.writeHead(200, {'Content-Type': 'text/plain'});

   // Measure between two points:
   let result = distance(45.527517, -122.718766, 45.373373, -121.693604);
   // Measure a list of GPS points along a path:
    let path = [
      [45.527517, -122.718766],
      [45.373373, -121.693604],
      [45.527517, -122.718766]
    ];
    let result2 = distance(path);

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

    let firstPointTime = gpx.tracks[0].points[0].time;
    let lastPointTime = gpx.tracks[0].points[gpx.tracks[0].points.length - 1].time;
    console.log(`first point time is ${JSON.stringify(gpx.tracks[0].points[0].time)}`);
    console.log(`last point time is ${JSON.stringify(gpx.tracks[0].points[gpx.tracks[0].points.length - 1].time)}`);

    // all trails call this total time as opposed to moving time which is typically smaller
    // let duration = moment.utc(moment(lastPointTime).diff(moment(firstPointTime))).format("HH:mm:ss")
    var duration = moment.duration(moment(lastPointTime).diff(moment(firstPointTime)));
    var durMinutes = duration.asMinutes();
    console.log(`durMinutes - ${durMinutes}`);

    // again, AllTrails would use moving time for this pace and not total time
    let paceMinPerMiles = durMinutes / totalDistanceMiles;

    response.end(`distance in meters - ${totalDistanceMeters} and in miles - ${totalDistanceMiles} duration - ${durMinutes} pace - ${paceMinPerMiles}`);



    }).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');
