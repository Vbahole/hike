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
  console.log(`putting ${records.length} records to dynamo table ${dbTableName} \n`);

  return records.map((r) => {
    /*
      let params = {
        TableName: dbTableName,
        Item: {
          'h': 'recording',
          'r': r.date,
          'durationMinutes': r.durationMinutes,
          'paceMinPerMile': r.paceMinPerMiles,
          'totalDistanceMiles': r.totalDistanceMiles,
          'points': r.points
        }
      };
      */
      // don't define the item while putting it in, just slap it in
      let params = {
        TableName: dbTableName,
        Item: r
      };

      docClient.put(params, function(err, data) {
        if (err) {
          console.log(`PUT error - ${JSON.stringify(err)} \n`)
        } else {
        }
      });
    });
  };

exports.putToDynamo = putToDynamo;
