const AWS = require('aws-sdk');
const moment = require('moment');

// AWS
AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});

const testIt = () => {
  console.log(`testing`);
  const w = moment().week();
  console.log(`what week is this ${w}`);
  const fw = moment().startOf('week');
  console.log(`start of week is this ${fw}`);
  const aWeek = moment().week(35);
  console.log(`aWeek is this ${aWeek}`);
  const startOfAWeek = moment().week(34).startOf('week');
  const endOfAWeek = moment().week(34).endOf('week');
  console.log(`aWeek is ${startOfAWeek} thru ${endOfAWeek}`);
  //		7/15/2020
  const t = moment('7/15/2020', 'MM/DD/YYYY').week();
  // get rid of warning message by hinting with a format string
  // moment("12-25-1995", "MM-DD-YYYY");
  console.log(`t is this ${t}`);

  const cars = [{
      make: 'audi',
      model: 'r8',
      year: '2012'
    },
    {
      make: 'audi',
      model: 'rs5',
      year: '2013'
    },
    {
      make: 'ford',
      model: 'mustang',
      year: '2012'
    },
    {
      make: 'ford',
      model: 'fusion',
      year: '2015'
    },
    {
      make: 'kia',
      model: 'optima',
      year: '2012'
    }
  ];
  const result = cars.reduce(function( r, a ) {
    r[a.make] = r[a.make] || [];
    r[a.make].push(a);
    return r;
  }, {});
  console.log(result);

  /*
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
  */

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
