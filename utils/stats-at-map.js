let AWS = require('aws-sdk');
let moment = require('moment');

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});

// (dynamo table name, optionally a map record set from at-map, or will pull 'at-map-medium' from aws)
const computeStatsATMap = async (dbTableName, records, itemType = 'at-map-medium') => {
  let params = {
    ExpressionAttributeValues: {
      ':s': itemType
    },
    KeyConditionExpression: 'h = :s',
    TableName: dbTableName
  };
  if (!records) {
    records = await docClient.query(params).promise();
    records = records.Items;
  }
  console.log(`stats computing for ${records.length} map objects \n`);

  // OVERALL STATS
  const totalDistance = records.reduce((accum, item) => accum + item.summaryStats.distanceTotal, 0);
  const totalDurationMinutes = records.reduce((accum, item) => accum + item.summaryStats.duration, 0);
  const totalDurationHours = moment.duration(totalDurationMinutes, 'minutes').asHours();
  const overallPace = records.reduce((accum, item) => accum + item.summaryStats.paceAverage, 0);
  const totalHikeCount = records.reduce((accum, item) => accum + 1, 0);

  // these now work against dailys unlike consolidated gpx recordings
  const hikesPerDay = records.reduce(function (accum, item) {
    let iDate = moment(item.r).format('MM/DD/YYYY');
    accum[iDate] = (accum[iDate] || 0) + 1;
    return accum;
  }, {});
  let maxHikeCount = Math.max(...Object.values(hikesPerDay));
  let maxHikeDays = Object.keys(hikesPerDay).filter(k => hikesPerDay[k] === maxHikeCount);
  /*
  hikesPerDay - {
    "09/08/2020": 2,
    "09/06/2020": 2,
    "09/05/2020": 3
  }
  */

  const metersPerDay = records.reduce(function (accum, item) {
    let iDate = moment(item.r).format('MM/DD/YYYY');
    accum[iDate] = (accum[iDate] || 0) + item.summaryStats.distanceTotal;
    return accum;
  }, {});
  console.log(`metersPerDay - ${JSON.stringify(metersPerDay, null, 2)}`);
  let maxMetersPerDay = Math.max(...Object.values(metersPerDay));
  let maxMetersDay = Object.keys(metersPerDay).filter(k => metersPerDay[k] === maxMetersPerDay);
  console.log(`maxMetersPerDay - ${JSON.stringify(maxMetersPerDay, null, 2)}`);
  console.log(`maxMetersDay - ${JSON.stringify(maxMetersDay, null, 2)}`);
  /*
    let arr = ['foo', 'foo', 'foo', 'bar', 'bar', 'bar', 'baz', 'baz'];
    let counts = arr.reduce((a, c) => {
      a[c] = (a[c] || 0) + 1;
      return a;
    }, {});
    let maxCount = Math.max(...Object.values(counts));
    console.log(maxCount);
    console.log(mostFrequent);
    let mostFrequent = Object.keys(counts).filter(k => counts[k] === maxCount);
  */

  /*
  var mostExpPilot = pilots.reduce(function (oldest, pilot) {
    return (oldest.years || 0) > pilot.years ? oldest : pilot;
    }, {});
*/

  /*
    const mostMilesHikedInOneDay = records.reduce((accum, item) =>
      ( accum.totalDistanceMiles || 0 ) > item.totalDistanceMiles ? accum : item, {});

    // const hikesInAugust = records.filter(i => i.r == '8/11/2020');
    const hikesInAugust = records.filter(function (i) {
      console.log(`what week is it - ${moment(i.r).week()}`);
        return i.r === '8/11/2020';
      });
    // console.log(`any august - ${JSON.stringify(hikesInAugust)}`);

    const byWeeks = records.reduce(function (accum, item) {
      let w = moment(item.r, 'MM/DD/YYYY').week();
      accum[w] = accum[w] || [];
      accum[w].push(item);
      return accum;
      }, {});
  */
  // console.log(`byWeeks - ${JSON.stringify(byWeeks, null, 2)}`);

  // const statsByWeek = byWeeks.reduce((accum, item) => accum + item.hikeCount, 0);
  // console.log(`statsByWeek - ${JSON.stringify(statsByWeek, null, 2)}`);

  params = {
    TableName: dbTableName,
    Item: {
      'h': 'stat',
      'r': 'overall',
      'totalDistanceMeters': totalDistance,
      'totalDurationMinutes': totalDurationMinutes,
      'totalDurationHours': totalDurationHours,
      'overallPaceMinutesPerKilometer': overallPace,
      'totalHikeCount': totalHikeCount,
      'mostHikesInOneDay': {
          'hikes': maxHikeCount,
          'dates': maxHikeDays
        },
      'mostMetersHikedInOneDay': {
          'meters': maxMetersPerDay,
          'date': maxMetersDay
        }
    }
  };

  console.log(`stats overall put params ${JSON.stringify(params)}`);

  docClient.put(params, function(err, data) {
    if (err) {
      console.log(`stats Error in put ${JSON.stringify(err)}`);
    } else {
      // console.log("Success", data);
    }
  });
};

exports.computeStatsATMap = computeStatsATMap;
