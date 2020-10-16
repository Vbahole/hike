let AWS = require('aws-sdk');
let moment = require('moment');

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});

// (dynamo table name, term to select on)
const purgeItems = async (dbTableName, term) => {
  console.log(`purging all - "${term}"`);

  let params = {
    ExpressionAttributeValues: {
      ':s': term
    },
    KeyConditionExpression: 'h = :s',
    TableName: dbTableName
  };

  result = await docClient.query(params).promise();
  console.log(`anything to purge? - ${result.Items.length}`);
  for (const item of result.Items) {
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
  console.log(`done purging- "${term}"`);
};

exports.purgeItems = purgeItems;
