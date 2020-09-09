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
  /*
    const mostHikesInOneDay = records.reduce((accum, item) =>
      ( accum.hikeCount || 0 ) > item.hikeCount ? accum : item, {});

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
      'totalDistanceMiles': totalDistance,
      'totalDurationMinutes': totalDurationMinutes,
      'totalDurationHours': totalDurationHours,
      'overallPaceMinutesPerMile': overallPace,
      'totalHikeCount': totalHikeCount
      /*
            ,
            'mostHikesInOneDay': {
                'hikes': mostHikesInOneDay.hikeCount,
                'date': mostHikesInOneDay.r
              },
            'mostMilesHikedInOneDay': {
                'miles': mostMilesHikedInOneDay.totalDistanceMiles,
                'date': mostMilesHikedInOneDay.r
              },
            'hikesInAugust': {
                'hike': hikesInAugust[0].r
              }
      */
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
