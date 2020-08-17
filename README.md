# hike

an app to compile gpx tracks and store them for stats.

`nodemon main.js`


using gpxparser - https://github.com/Luuka/GPXParser.js
to read in gpx and get distance and time for start end points


crummy manual part
Export gpx tracks out of alltrails to folder

node script (running locally) to:
-parse all downloaded gpx files in a folder
-dedup the tracks (by id or start time) - maybe not, just push them all each time to dynamo
-put to dynamo (datetime, then an object with (track coordinates, time})
Once in dynamo:
-compile stats (maybe with a stream trigger to keep up to date)
-website to show breakdowns
-visualizations
The dynamo trigger would fire on any inserts, the dedup should take care of sending identical records to dynamo, maybe have a mode to allow the overwrites though as we need a full set to keep the stats up to date.
On each insert run a lambda that compiles the current recording and feed back some summary stats to that, but also write to another dynamo item that is a stat warehouse with different kinds of breakdowns
Gpx delivers - lat, lon, elevation, and time. Route and track exports appear to be the same but the elevation is off between the two - very odd
