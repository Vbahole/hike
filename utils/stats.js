let AWS = require("aws-sdk");

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
  console.log(`starting stats`);
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
  console.log(`read ${JSON.stringify(result.Count)} recordings`);

  // total distance
  let arr = result.Items;

  // array = [{"adults":2,"children":3},{"adults":2,"children":1}];
  var totalDistance = arr.reduce((accum,item) => accum + item.track.totalDistanceMiles, 0);
  console.log(`total distance is ${totalDistance}`);

  // put a stat
  params = {
    TableName: dbTableName,
    Item: {
      'h': 'stat',
      'r': 'stat',
      'stat': {
        'totalDistanceMiles': totalDistance,
      }
    }
  };

  docClient.put(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      // console.log("Success", data);
    }
  });
};

exports.stats = stats;
