let AWS = require('aws-sdk');
let moment = require('moment');

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});

// (dynamo table name, optionally a gpxRecord set, or will pull from aws)
const computeStats = async (dbTableName, gpxRecords, itemType = 'consolidate') => {
  let params = {
      ExpressionAttributeValues: {
        ':s': itemType
       },
       KeyConditionExpression: 'h = :s',
       TableName: dbTableName
    };
  if (!gpxRecords){
    gpxRecords = await docClient.query(params).promise();
    gpxRecords = gpxRecords.Items;
  }
  console.log(`stats computing for ${gpxRecords.length} recordings \n`);

  // OVERALL STATS
  const totalDistance = gpxRecords.reduce((accum,item) => accum + item.totalDistanceMiles, 0);
  const totalDurationMinutes = gpxRecords.reduce((accum,item) => accum + item.durationMinutes, 0);
  const totalDurationHours = moment.duration(totalDurationMinutes, 'minutes').asHours();
  const overallPace = totalDurationMinutes / totalDistance;

  params = {
    TableName: dbTableName,
    Item: {
      'h': 'stat',
      'r': 'overall',
      'totalDistanceMiles': totalDistance,
      'totalDurationMinutes': totalDurationMinutes,
      'totalDurationHours': totalDurationHours,
      'overallPaceMinutesPerMile': overallPace
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

exports.computeStats = computeStats;
