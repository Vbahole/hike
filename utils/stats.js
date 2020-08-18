let AWS = require("aws-sdk");

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});
const dbTableName = 'hike';

const stats = () => {
  console.log('*stats*  '.repeat(10));
  console.log(`starting stats`);
  let params;

  // read all recordings
  params = {
    ExpressionAttributeValues: {
      ':s': 'recording'
     },
   KeyConditionExpression: 'h = :s',
   // FilterExpression: 'contains (Subtitle, :topic)',
   TableName: dbTableName
  };

  docClient.query(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log(`read ${JSON.stringify(data.Count)} recordings`);
    }
  });

  // put a stat
  params = {
    TableName: dbTableName,
    Item: {
      'h': 'stat',
      'r': 'stat',
      'stat': {
        'totalMiles': 55,
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
