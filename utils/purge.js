let AWS = require('aws-sdk');
let moment = require('moment');

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});

// (dynamo table name)
const purgeRecordings = async (dbTableName) => {
  console.log(`purging recordings`);
  let params;

  // read all recordings from dynamodb
  params = {
      ExpressionAttributeValues: {
        ':s': 'recording'
       },
       KeyConditionExpression: 'h = :s',
       TableName: dbTableName
    };

  gpxRecords = await docClient.query(params).promise();
  console.log(`anything to purge? - ${gpxRecords.Items.length}`);
  for (const item of gpxRecords.Items) {
    params = {
      Key: {
        'h': item.h,
        'r': item.r
      },
      TableName: dbTableName
    };
    docClient.delete(params, function(err, data) {
      if (err) console.log(err);
    });
  };
  console.log(`done purging`);
};

exports.purgeRecordings = purgeRecordings;
