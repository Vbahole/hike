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

const consolidate = async (dbTableName, gpxRecords) => {
  console.log(`consolidating`);

  // read all recordings
  let params = {
      ExpressionAttributeValues: {
        ':s': 'recording'
       },
       KeyConditionExpression: 'h = :s',
       TableName: dbTableName
    };
  if (!gpxRecords){
    gpxRecords = await docClient.query(params).promise();
    gpxRecords = gpxRecords.Items;
  }
  console.log(`consolidating ${gpxRecords.length} recordings`);

  // DAILY CONSOLIDATE
  let resultArr = [];
  let dateArr = [];
  let clone = JSON.parse(JSON.stringify(gpxRecords));

  for (let i of clone) {
    console.log(`consolidating this item - ${JSON.stringify(i, null, 2)}`);
    let rDate = i.date;
    console.log(`consolidate rDate is ${rDate}`);
    let ind = dateArr.indexOf(rDate);
    if (ind == -1) {
        dateArr.push(rDate);
        resultArr.push(i);
      }
      else {
        resultArr[ind].durationMinutes += i.durationMinutes;
        resultArr[ind].totalDistanceMiles += i.totalDistanceMiles;
        resultArr[ind].paceMinPerMile = (resultArr[ind].durationMinutes / resultArr[ind].totalDistanceMiles);
        resultArr[ind].multiHike = 'true';
      }
  }

  console.log(`resultArr - ${JSON.stringify(resultArr, null, 2)}`);
  console.log(`dateArr - ${JSON.stringify(dateArr, null, 2)}`);

  return resultArr;
};

const transformRaw = async (gpxRecords) => {
  console.log(`transformRaw`);
  return gpxRecords.map((i) => {
      console.log(`********before****** - ${JSON.stringify(i, null, 2)}`);
      i.h = 'recording';
      i.r = i.date;
      delete i.date;
      console.log(`********after****** - ${JSON.stringify(i, null, 2)}`);
    });
}

module.exports = { consolidate, transformRaw };
