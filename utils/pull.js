const fs = require('fs');
const appRoot = require('app-root-path');
const path = require('path');
const AWS = require("aws-sdk");
const util = require('util');
// var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_file = fs.createWriteStream(`${appRoot}/logs/debug.log`, {
  flags: 'w'
});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient ({
  apiVersion: '2012-08-10'
});
const dbTableName = 'hike';

async function pull() {
  const params = {
    TableName: dbTableName
  };

  docClient.scan(params, function(err, data) {
    if (err) {
      console.log('Error', err);
    } else {
      let result = data.Items.map(({
        points,
        ...rest
      }) => rest); // remove track
      // const { a, ...rest } = data;
      // let result = data.Items.map(({track, ...rest}) => rest);
      // let result = data;
      console.log(`${JSON.stringify(result, null, 2)}`);
    }
  });
}
exports.pull = pull;
