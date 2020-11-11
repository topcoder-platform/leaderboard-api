/**
 * Leaderboard Schema
 */

const config = require('config')
const dynamoose = require('dynamoose')

const Schema = dynamoose.Schema

const LeaderboardSchema = new Schema({
  reviewId: {
    type: String,
    index: {
      name: 'reviewId-index',
      global: true
    }
  },
  submissionId: { type: String },
  challengeId: {
    type: String,
    hashKey: true
  },
  memberId: { type: String, rangeKey: true },
  handle: { type: String },
  aggregateScore: { type: Number },
  testsPassed: { type: Number },
  scoreLevel: { type: String },
  scoreResetTime: { type: Number },
  totalTestCases: { type: Number },
  groupIds: {
    type: Array,
    schema: [String]
  },
  status: { type: String },
  finalDetails: {
    type: Object,
    schema: {
      aggregateScore: Number,
      testsPassed: Number,
      totalTestCases: Number
    }
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

module.exports = LeaderboardSchema
