let AWS = require('aws-sdk');
let moment = require('moment');

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
  console.log(`reading ${JSON.stringify(result.Count)} recordings`);

  // DAILY STATS
  let resultArr = [];
  let dateArr = [];
  let dailyClone = JSON.parse(JSON.stringify(result.Items));
  for (let i of dailyClone) {
    let rDate = moment(i.r).format('L');
    console.log(`rDate is ${rDate}`);
    let ind = dateArr.indexOf(rDate);
    if (ind == -1) {
        dateArr.push(rDate);
        let obj = {
          Date: rDate,
          durationMinutes: i.track.durationMinutes,
          totalDistanceMiles: i.track.totalDistanceMiles,
          paceMinPerMile: i.track.paceMinPerMile
        };
        resultArr.push(obj);
      }
      else {
        resultArr[ind].durationMinutes += i.track.durationMinutes;
        resultArr[ind].totalDistanceMiles += i.track.totalDistanceMiles;
        resultArr[ind].paceMinPerMile = (resultArr[ind].durationMinutes / resultArr[ind].totalDistanceMiles);
      }
  }
  console.log(`${JSON.stringify(resultArr, null, 2)}`);


  // OVERALL STATS
  let totalDistance = result.Items.reduce((accum,item) => accum + item.track.totalDistanceMiles, 0);
  let totalDuration = result.Items.reduce((accum,item) => accum + item.track.durationMinutes, 0);
  let overallPace = totalDuration / totalDistance;

  params = {
    TableName: dbTableName,
    Item: {
      'h': 'stat',
      'r': 'overall',
      'stat': {
        'totalDistanceMiles': totalDistance,
        'totalDurationMinutes': totalDuration,
        'overallPaceMinutesPerMile': overallPace
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
