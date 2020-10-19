// send parsed gpx to dynamodb
const AWS = require('aws-sdk');

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});

const thePut = async (i, dbTableName) => {
  const params = {
    TableName: dbTableName,
    Item: i
  };
  // console.log(`putting------- ${JSON.stringify(params, null, 2)} \n`);
  docClient.put( params, function(err, data) {
    if (err) {
      console.log(`PUT error - ${JSON.stringify(err)} \n`)
    }
  });
};

// (destination dynamo table name, parsed gpx files)
const putToDynamo = async (dbTableName, gpxRecords) => {
  console.log(`putting ${gpxRecords.length} records to dynamo table ${dbTableName} \n`);
  return Promise.all(gpxRecords.map(i => thePut(i, dbTableName)));
  /*
      rec = {
        "totalDistanceMeters": 888888888.1359228910228,
      "totalDistanceMiles": 1.116688526753368,
      "firstPointTime": "2020-08-16T19:00:14.000Z",
      "lastPointTime": "2020-08-16T19:46:49.000Z",
      "durationMinutes": 46.583333333333336,
      "paceMinPerMiles": 41.71560127761727,
      "points": [],
      "h": "recording",
      "r": "Sun Aug 16 2020 15:00:14 GMT-0400"
      };
  */

  // one way to get er done
  /*
  for (let rec of gpxRecords) {
    console.log(JSON.stringify(rec));
    let params = {
      TableName: dbTableName,
      Item: rec
    };
    console.log(`putting------- ${JSON.stringify(params, null, 2)} \n`);
    docClient.put(params, function(err, data) {
      if (err) {
        console.log(`PUT error - ${JSON.stringify(err)} \n`)
      } else {
        console.log('worked');
      }
    });
  }
  */

  /*
    let params = {
      TableName: dbTableName,
      Item: {
        "h" : records[0].h,
        "r" : records[0].r
      }
    };
    console.log(`putting------- ${JSON.stringify(params, null, 2)} \n`);
    docClient.put(params, function(err, data) {
      if (err) {
        console.log(`PUT error - ${JSON.stringify(err)} \n`)
      } else {
      }
    });
    */

  /* another way
    return records.map((i) => {
        let params = {
          TableName: dbTableName,
          Item: i
        };
        console.log(`putting------- ${JSON.stringify(params, null, 2)} \n`);
        docClient.put(params, function(err, data) {
          if (err) {
            console.log(`PUT error - ${JSON.stringify(err)} \n`)
          } else {
          }
        });
      });
    */
};

exports.putToDynamo = putToDynamo;
