# hike

an app to compile gpx tracks and store them for stats.

`nodemon main.js`


using gpxparser - https://github.com/Luuka/GPXParser.js
to read in gpx and get distance and time for start end points

DynamoDB
--------------
the hash is a string:
  recording - includes raw points array, can be many per day, includes distance/total time for that set of points
  stats -
    hash can be:
    -overall - calced on the whole dataset
    -daily - same object as recording but cumulative dist/time and array of array of points (could be better for mapping)

issues
----------
moving time - can't calc that, yet
manual uploads
date collapsing
when to update stats
daily stats is mutating the recording object - make it match the recording object but with a point-track array. make them all points arrays. might make it easier to map later.
make the range key a date so it sorts
don't just track today's overall stats, track all time - calc all stats at any point in time
great for progression/gamification

flexible
--------------
gpx file location - local, s3, something else


crummy manual part - maybe download on phone push to s3, it pick it up
convert your local drive part to an s3 bucket
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
