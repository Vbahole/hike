// send parsed gpx to dynamodb
let AWS = require("aws-sdk");

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});

const testIt = () => {
  console.log(`testing`);

  params = {
    Key: {
      'h': 'recording',
      'r': '7/15/2020'
    },
    TableName: 'hike'
  };
  console.log(`test! - ${JSON.stringify(params, null, 2)}`);
  // let res = docClient.delete(params);
  docClient.delete(params, function(err, data) {
    if (err) console.log(err);
    else console.log(data);
  });
};

exports.testIt = testIt;
