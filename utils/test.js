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

// PUT
let params = {
  TableName: 'hike',
  Item: {
     "totalDistanceMeters": 1727.5321843222155,
     "totalDistanceMiles": 1.0734387673507002,
     "firstPointTime": "2020-08-29T01:20:34.000Z",
     "lastPointTime": "2020-08-29T01:42:37.000Z",
     "durationMinutes": 22.05,
     "paceMinPerMiles": 20.541460463944755,
     "points": [],
     "h": "recording",
     "r": "Fri Aug 28 2020 21:20:34 GMT-0400"
   }
  };
console.log(`putting------- ${JSON.stringify(params, null, 2)} \n`);
docClient.put(params, function(err, data) {
  if (err) {
    console.log(`PUT error - ${JSON.stringify(err)} \n`)
  } else {
    console.log('it worked');
  }
});

// DELETE
/*
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
  */
};

exports.testIt = testIt;
