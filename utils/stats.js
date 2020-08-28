let AWS = require('aws-sdk');
let moment = require('moment');

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});
const dbTableName = 'hike';

async function stats() {
  console.log('*stats*  '.repeat(10));
  let params;

  // read all recordings
  params = {
      ExpressionAttributeValues: {
        ':s': 'recording'
       },
       KeyConditionExpression: 'h = :s',
       TableName: dbTableName
    };
  var result = await docClient.query(params).promise()
  console.log(`stats reading ${JSON.stringify(result.Count)} recordings`);

  // OVERALL STATS
  let totalDistance = result.Items.reduce((accum,item) => accum + item.totalDistanceMiles, 0);
  let totalDuration = result.Items.reduce((accum,item) => accum + item.durationMinutes, 0);
  let overallPace = totalDuration / totalDistance;

  params = {
    TableName: dbTableName,
    Item: {
      'h': 'stat',
      'r': 'overall',
      'stat': {
        'totalDistanceMiles': totalDistance,
        'totalDurationMinutes': totalDuration,
        'overallPaceMinutesPerMile': overallPace
      }
    }
  };

  docClient.put(params, function(err, data) {
    if (err) {
      console.log("stats Error in put", err);
    } else {
      // console.log("Success", data);
    }
  });
};

exports.stats = stats;
