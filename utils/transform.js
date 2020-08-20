let AWS = require('aws-sdk');
let moment = require('moment');
const appRoot = require('app-root-path');
let { kill } = require(`${appRoot}/utils/kill-points`);

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});
const dbTableName = 'hike';

async function consolidate() {
  console.log('*consolidate*  '.repeat(7));
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
  console.log(`consolidating ${JSON.stringify(result.Count)} recordings`);
  // console.log(`Items ${JSON.stringify(kill(result), null, 2)}`);

  // DAILY CONSOLIDATE
  let resultArr = [];
  let dateArr = [];
  let dailyClone = JSON.parse(JSON.stringify(result.Items));
  for (let i of dailyClone) {
    // console.log(`transform - i is ${JSON.stringify(kill(i), null, 2)}`);\
    console.log(`consolidate - i is ${JSON.stringify(i.r)}`);
    let rDate = moment(i.r).format('L');
    console.log(`consolidate rDate is ${rDate}`);
    let ind = dateArr.indexOf(rDate);
    if (ind == -1) {
        dateArr.push(rDate);
        let obj = {
          Date: rDate,
          durationMinutes: i.durationMinutes,
          totalDistanceMiles: i.totalDistanceMiles,
          paceMinPerMile: i.paceMinPerMile
        };
        resultArr.push(obj);
      }
      else {
        resultArr[ind].durationMinutes += i.durationMinutes;
        resultArr[ind].totalDistanceMiles += i.totalDistanceMiles;
        resultArr[ind].paceMinPerMile = (resultArr[ind].durationMinutes / resultArr[ind].totalDistanceMiles);
      }
  }
  params = {
    TableName: dbTableName,
    Item: {
      'h': 'daily',
      'r': 'asOfDate',
      'stat': resultArr
    }
  };

  docClient.put(params, function(err, data) {
    if (err) {
      console.log(`consolidate error ${JSON.stringify(err)}`);
    } else {
      // console.log("Success", data);
    }
  });
};

exports.consolidate = consolidate;
