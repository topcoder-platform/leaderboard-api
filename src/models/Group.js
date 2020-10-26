/**
 * Group Schema
 */

const config = require('config')
const dynamoose = require('dynamoose')

const Schema = dynamoose.Schema

const GroupSchema = new Schema({
  groupId: {
    type: Number,
    hashKey: true
  }
}, {
  throughput: {
    read: Number(config.AMAZON.DYNAMODB_READ_CAPACITY_UNITS),
    write: Number(config.AMAZON.DYNAMODB_WRITE_CAPACITY_UNITS)
  }
})

module.exports = GroupSchema
