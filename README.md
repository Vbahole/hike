# hike

an app to compile and store All Trails hike recordings and generate statistics.

## prereqs
node, aws cli installed; aws cli configured for access to aws resources  

## run
- visit alltrails.com, login, go to recordings
- in dev tools on the network tab look for the `maps?` xhr call
- export the request as a curl command (see sample in this repo)
- edit to get type=track and detail=medium
- use that to replace stubs/at-track-medium.json in this project
- run it through JSONLint <https://jsonlint.com/> to clean it (optional)

- `node (or nodemon) main.js`  
- should update the hike table in dynamo

## options
- source to import from
- push all recordings to DynamoDB
- compute overall stats
- consolidate for daily stats

## AllTrails recording exports in gpx formula (defecated)
- uses gpxparser - <https://github.com/Luuka/GPXParser.js> to read gpx, get distance and time from start end points
- cannot get moving time and have to export all recordings manually

## AllTrails request version (at-map)
Upload results of All Trails 'map' xhr request jacked via dev tools
<https://www.alltrails.com/api/alltrails/my/maps?presentation_type=track&detail=medium>
pick and choose which fields from the raw response to push to dynamo

After the import, code works the same for both

## Daily Consolidation - collapse by day
reduce function summarizes stats for a day by collapsing all hikes from any one day

## Main Steps
- import - from at-map.json curl result
- transform:at-map - filter fields before dynamo dump
- consolidate - flatten multiple hikes in the same day to get compilation stats
- put - send raw to dynamo
- stats - build stats on either the raw daily gpx tracks or the consolidate
- put - send overal stat to dynamo

### DynamoDB -- hash named 'h' of type string; range named 'r' type string
recording item
h=at-map-medium - range=date; many hikes per 1 day:
```
{
 "r": "2020-07-08T20:41:10Z",
 "h": "at-map-medium",
 "summaryStats": {
  "duration": 73,
  "timeTotal": 5521,
  "elevationLoss": 11,
  "speedAverage": 1.2393847209515096,
  "elevationGain": 11,
  "calories": 632,
  "distanceTotal": 5418.59,
  "timeMoving": 4372,
  "updatedAt": "2020-07-08T22:14:29+00:00",
  "paceAverage": 0.8068519670246318
 }
}
```
stat item
h=stats - r=overall - calculated on the whole dataset (right now during import, but could be offline/periodic):
```
{
 "totalHikeCount": 135,
 "r": "overall",
 "AverageSpeedKilometersPerHour": 5.09,
 "mostHikesInOneDay": {
  "hikes": 4,
  "dates": [
   "10/15/2020"
  ]
 },
 "h": "stat",
 "totalDistanceKm": 581.08,
 "mostKmsHikedInOneDay": {
  "kms": 18.32563,
  "date": [
   "11/14/2020"
  ]
 },
 "AveragePaceMinutesPerKilometer": 12.13,
 "totalDurationHours": 113.3
}
```
  
## stat ideas

- weekly totals
- number of hikes by mileage
- longest/shortest hike
- average hike length/duration
- streaks
- current week total
- monthly breakdowns
- concept of **tours** - long-running segments of times, like a month or two or since i began to meet certain goals

## issues

* * *

- moving time - can't calc that, yet
- manual uploads - hard to tell what you have uploaded, but shouldn't matter
- date collapsing - how to combine multiple hikes in one day yet retain the granularity
- when to update stats - on import, at any time, via stream (trim horizon)
- sorting - web interface doesn't appear to sort by range
- don't just track today's overall stats, track all time - calc all stats at any point in time
- great for progression/gamification

## flexible

* * *

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

1.compile stats (maybe with a stream trigger to keep up to date)
2.website to show breakdowns
3.visualizations
    The dynamo trigger would fire on any inserts, the dedup should take care of sending identical records to dynamo, maybe have a mode to allow the overwrites though as we need a full set to keep the stats up to date.
    On each insert run a lambda that compiles the current recording and feed back some summary stats to that, but also write to another dynamo item that is a stat warehouse with different kinds of breakdowns
    Gpx delivers - lat, lon, elevation, and time. Route and track exports appear to be the same but the elevation is off between the two - very odd

recording:

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
