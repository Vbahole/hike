// send parsed gpx to dynamodb
let AWS = require("aws-sdk");

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});

// (destination dynamo table name, parsed gpx files)
const putToDynamo = (dbTableName, records) => {
  return records.map((r) => {
      let params = {
        TableName: dbTableName,
        Item: {
          'h': 'recording',
          'r': r.firstPointTime.toString(),
          'durationMinutes': r.durMinutes,
          'paceMinPerMile': r.paceMinPerMiles,
          'totalDistanceMiles': r.totalDistanceMiles,
          'points': r.points
        }
      };

      docClient.put(params, function(err, data) {
        if (err) {
          console.log(`PUT error - ${JSON.stringify(err)}`)
          return null;
        } else {
          console.log(`PUT worked - ${JSON.stringify(data, null, 2)}`)
          return data;
        }
      });
    });
  };

exports.putToDynamo = putToDynamo;
