/**
 * Group Schema
 */

const config = require('config')
const dynamoose = require('dynamoose')

const Schema = dynamoose.Schema

const GroupSchema = new Schema({
  groupId: {
    type: String,
    hashKey: true
  },
  createdAt: {
    type: String,
    required: true
  },
  updatedAt: {
    type: String,
    required: true
  }
}, {
  throughput: {
    read: Number(config.AMAZON.DYNAMODB_READ_CAPACITY_UNITS),
    write: Number(config.AMAZON.DYNAMODB_WRITE_CAPACITY_UNITS)
  }
})

module.exports = GroupSchema
