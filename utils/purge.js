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
const purgeTable = async (dbTableName) => {
  console.log(`purging`);
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

  for (const item of gpxRecords.Items) {
    params = {
      Key: {
        'h': item.h,
        'r': item.r
      },
      TableName: dbTableName
    };
    await docClient.delete(params);
  };
};

exports.purgeTable = purgeTable;
