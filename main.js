let http = require('http');
let fs = require('fs');
var appRoot = require('app-root-path');
let distance = require('gps-distance');
let gpxParser = require('gpxparser');
var convert = require('convert-units');
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

    // const data = fs.readFileSync(sampleGPX, {encoding:'utf8', flag:'r'});
    console.log(totalDistanceMeters);
    let totalDistanceMiles = convert(totalDistanceMeters).from('m').to('mi')

    response.end(`distance in meters - ${totalDistanceMeters} and in miles - ${totalDistanceMiles}`);
    }).listen(8081);

// Console will print the message
console.log('Server running at http://127.0.0.1:8081/');
