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

  for (const i of clone) {
    // console.log(`consolidating this item - ${JSON.stringify(i, null, 2)}`);
    let rDate = moment(i.r).format('M/D/YYYY').toString();
    // console.log(`consolidate rDate is ${rDate}`);
    let ind = dateArr.indexOf(rDate);
    if (ind == -1) {
        dateArr.push(rDate);
        i.multiHike = false;
        i.hikeCount = 1;
        resultArr.push(i);
      }
      else {
        // combined stats
        resultArr[ind].durationMinutes += i.durationMinutes;
        resultArr[ind].totalDistanceMiles += i.totalDistanceMiles;
        resultArr[ind].paceMinPerMile = (resultArr[ind].durationMinutes / resultArr[ind].totalDistanceMiles);
        resultArr[ind].multiHike = true;
        resultArr[ind].hikeCount += 1;
        resultArr[ind].points.push(i.points);
      }
  }

  // console.log(`resultArr - ${JSON.stringify(resultArr, null, 2)}`);
  console.log(`dateArr - ${JSON.stringify(dateArr, null, 2)}`);

  return resultArr;
};

const rawMap = async i => {
  i.h = 'recording';
  i.r = i.date;
  i.firstPointTime = i.firstPointTime.toString();
  i.lastPointTime = i.lastPointTime.toString();
  delete i.date;
  return i;
};

const transformRaw = async (gpxRecords) => {
  console.log(`transformRaw`);
  return Promise.all(gpxRecords.map( i => rawMap(i)));
}

const rawConsolidated = async i => {
  i.h = 'consolidate';
  i.r = moment(i.r).format('M/D/YYYY').toString();
  i.firstPointTime = i.firstPointTime.toString();
  i.lastPointTime = i.lastPointTime.toString();
  delete i.date;
  return i;
};

const transformConsolidated = async (gpxRecords) => {
  console.log(`transformConsolidated`);
  return Promise.all(gpxRecords.map( i => rawConsolidated(i)));
}

module.exports = { consolidate, transformRaw, transformConsolidated };
