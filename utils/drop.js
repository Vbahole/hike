// send parsed gpx to dynamodb
const AWS = require('aws-sdk')

// AWS
AWS.config.update({
  region: 'us-east-1'
})
// var docClient = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })

var dynamodb = new AWS.DynamoDB()

// (dynamo table name)
const dropDynamo = (dbTableName) => {
  console.log(`dropping dynamo table ${dbTableName}`)

  var params = {
    TableName: dbTableName
  }

  dynamodb.deleteTable(params, function (err, data) {
    if (err) {
      console.error('Unable to delete table. Error JSON:', JSON.stringify(err, null, 2))
    } else {
      console.log('Deleted table. Table description JSON:', JSON.stringify(data, null, 2))
    }
  })
}

exports.dropDynamo = dropDynamo
