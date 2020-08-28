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
    let params = {
      TableName: dbTableName,
      Item: {
        'h': 'recording',
        'r': firstPointTime.toString(),
        'durationMinutes': durMinutes,
        'paceMinPerMile': paceMinPerMiles,
        'totalDistanceMiles': totalDistanceMiles,
        'points': parser.tracks[0].points
      }
    };

    docClient.put(params, function(err, data) {
      if (err) {
        // console.log("DEBUG", (new Error().stack.split("at ")[1]).trim());
        console.log(`pump error - ${JSON.stringify(err)}`)
      } else {
        // console.log("Success", data);
      }
    });
  });
};

exports.putToDynamo = putToDynamo;
