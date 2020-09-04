# hike

an app to compile gpx tracks and store them for stats.

`nodemon main.js`

uses gpxparser - https://github.com/Luuka/GPXParser.js to read gpx, get distance and time for start end points

### DynamoDB -- hash 'h' string; range 'r' also string
  h=recording - range=iso datetime; includes points array, many hikes per 1 day, includes distance/duration/pace stats

  h=consolidate - range=date only (06/20/2020), points array with all hikes for the day, stats per by day
  h=stats - r=overall - calculated on the whole dataset (right now during import, but could be offline/periodic)

## issues
----------
- moving time - can't calc that, yet
- manual uploads - hard to tell what you have uploaded, but shouldn't matter
- date collapsing - how to combine multiple hikes in one day yet retain the granularity
- when to update stats - on import, at any time, via stream (trim horizon)
- sorting - web interface doesn't appear to sort by range
- don't just track today's overall stats, track all time - calc all stats at any point in time
- great for progression/gamification

## flexible
---
- gpx file location - local, s3, something else

- crummy manual part - maybe download on phone push to s3, it pick it up
- convert your local drive part to an s3 bucket
- Export gpx tracks out of alltrails to folder

## node
node script (running locally) to:
- parse all downloaded gpx files in a folder
- dedup the tracks (by id or start time) - maybe not, just push them all each time to dynamo
- put to dynamo (datetime, then an object with (track coordinates, time})
Once in dynamo:
1. compile stats (maybe with a stream trigger to keep up to date)
2. website to show breakdowns
3. visualizations
The dynamo trigger would fire on any inserts, the dedup should take care of sending identical records to dynamo, maybe have a mode to allow the overwrites though as we need a full set to keep the stats up to date.
On each insert run a lambda that compiles the current recording and feed back some summary stats to that, but also write to another dynamo item that is a stat warehouse with different kinds of breakdowns
Gpx delivers - lat, lon, elevation, and time. Route and track exports appear to be the same but the elevation is off between the two - very odd

recording:
```
let params = {
  TableName: 'hike',
  Item: {
     "totalDistanceMeters": 1727.5321843222155,
     "totalDistanceMiles": 1.0734387673507002,
     "firstPointTime": "2020-08-29T01:20:34.000Z",
     "lastPointTime": "2020-08-29T01:42:37.000Z",
     "durationMinutes": 22.05,
     "paceMinPerMiles": 20.541460463944755,
     "points": [],
     "h": "recording",
     "r": "Fri Aug 28 2020 21:20:34 GMT-0400"
   }
  };
```
