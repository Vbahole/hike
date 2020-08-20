let fs = require('fs');
let appRoot = require('app-root-path');
let path = require('path');
let AWS = require("aws-sdk");
var util = require('util');
// var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_file = fs.createWriteStream(`${appRoot}/logs/debug.log`, {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

AWS.config.update({
  region: 'us-east-1'
});
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
});
const dbTableName = 'hike';

async function pull() {

  let params = {
    TableName: dbTableName
  };

  docClient.scan(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      // let result = data.Items.map(({track, ...rest}) => rest); // remove track
      let result = data.Items.map(({track, ...rest}) => rest);
      
      console.log(`${JSON.stringify(result, null, 2)}`);
    }
  });
}
exports.pull = pull;
