const AWS = require('aws-sdk')
const moment = require('moment')
const convert = require('convert-units')
const roundTo = require('round-to')

// AWS
AWS.config.update({
  region: 'us-east-1'
})
var docClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10'
})

// (dynamo table name, optionally a map record set from at-map, or will pull 'at-map-medium' from aws)
const computeStatsATMap = async (dbTableName, records, itemType = 'at-map-medium') => {
  let params = {
    ExpressionAttributeValues: {
      ':s': itemType
    },
    KeyConditionExpression: 'h = :s',
    TableName: dbTableName
  }

  if (!records) {
    records = await docClient.query(params).promise()
    records = records.Items
  }
  console.log(`STATS computing for ${records.length} map objects \n`)

  // sample summaryStats from AT
  /*
  "summaryStats": {
    "calories": 855,
    "duration": 77, -- minutes
    "timeTotal": 4683, -- seconds
    "updatedAt": "2020-10-15T18:06:05+00:00",
    "timeMoving": 4597, -- seconds
    "paceAverage": 0.6534925673572146, -- seconds/meter (timeMoving / distanceTotal)
    "speedAverage": 1.53023928649119, -- meters/second - (distanceTotal / timeMoving)
    "distanceTotal": 7034.51, -- meters, would be 4.4 miles or 7.03km
    "elevationGain": 62,
    "elevationLoss": 63
  }
  */

  // OVERALL STATS
  const totalDistance = roundTo(convert(records.reduce((accum, item) => accum + item.summaryStats.distanceTotal, 0)).from('m').to('km'), 2)
  const totalDurationHours = roundTo(convert(records.reduce((accum, item) => accum + item.summaryStats.duration, 0)).from('min').to('h'), 2)
  const paceSum = records.reduce((accum, item) => accum + item.summaryStats.paceAverage, 0)
  const speedSum = records.reduce((accum, item) => accum + item.summaryStats.speedAverage, 0)
  const totalHikeCount = records.reduce((accum, item) => accum + 1, 0)
  const averagePace = roundTo(convert(paceSum / totalHikeCount).from('s/m').to('min/km'), 2)
  const averageSpeed = roundTo(convert(speedSum / totalHikeCount).from('m/s').to('km/h'), 2)

  const hikesPerDay = records.reduce(function( accum, item ) {
    const iDate = moment(item.r).format('MM/DD/YYYY')
    accum[iDate] = (accum[iDate] || 0) + 1
    return accum
  }, {})
  /*
  hikesPerDay - {
    "09/08/2020": 2,
    "09/06/2020": 2,
    "09/05/2020": 3
  }
  */

  // most hikes in one day
  const maxHikeCount = Math.max(...Object.values(hikesPerDay))
  const maxHikeDays = Object.keys(hikesPerDay).filter(k => hikesPerDay[k] === maxHikeCount)

  // most kms hiked in any one day
  const metersPerDay = records.reduce(function( accum, item ) {
    const iDate = moment(item.r).format('MM/DD/YYYY')
    accum[iDate] = (accum[iDate] || 0) + item.summaryStats.distanceTotal
    return accum
  }, {})

  const maxMetersPerDay = Math.max(...Object.values(metersPerDay))
  const maxKmPerDay = convert(Math.max(...Object.values(metersPerDay))).from('m').to('km')
  const maxDay = Object.keys(metersPerDay).filter(k => metersPerDay[k] === maxMetersPerDay)

  params = {
    TableName: dbTableName,
    Item: {
      h: 'stat',
      r: 'overall',
      totalDistanceKm: totalDistance,
      totalDurationHours: totalDurationHours,
      AveragePaceMinutesPerKilometer: averagePace,
      AverageSpeedKilometersPerHour: averageSpeed,
      totalHikeCount: totalHikeCount,
      mostHikesInOneDay: {
        hikes: maxHikeCount,
        dates: maxHikeDays
      },
      mostKmsHikedInOneDay: {
        kms: maxKmPerDay,
        date: maxDay
      }
    }
  }

  console.log(`stats overall put params ${JSON.stringify(params)}`)

  docClient.put(params, function( err, data ) {
    if (err) {
      console.log(`stats Error in put ${JSON.stringify(err)}`)
    } else {}
  })
}

exports.computeStatsATMap = computeStatsATMap
