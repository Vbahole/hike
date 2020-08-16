# hike

an app to compile gpx tracks and store them for stats.

`nodemon main.js`


using gpxparser - https://github.com/Luuka/GPXParser.js - to read in gpx and get distance
could also use gps-distance - https://github.com/Maciek416/gps-distance - put couldn't get gpx read to work so would have to translate to coord array

Export gpx tracks out of alltrails to folder
Write a node script (probably best to run this locally and have it connect to dynamo) to:
-parse all tracks in folder
-dedup the tracks (by id or start time)
-put to dynamo (id, track coordinates, time)
Once in dynamo:
-compile stats (maybe with a stream trigger to keep up to date)
-website to show breakdowns
-visualizations
The dynamo trigger would fire on any inserts, the dedup should take care of sending identical records to dynamo, maybe have a mode to allow the overwrites though as we need a full set to keep the stats up to date.
On each insert run a lambda that compiles the current recording and feed back some summary stats to that, but also write to another dynamo item that is a stat warehouse with different kinds of breakdowns
Gpx delivers - lat, lon, elevation, and time. Route and track exports appear to be the same but the elevation is off between the two - very odd
