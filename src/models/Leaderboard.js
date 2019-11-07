/**
 * Leaderboard Schema
 */

const Schema = require('mongoose').Schema

const LeaderboardSchema = new Schema({
  reviewSummationId: { type: String },
  submissionId: { type: String },
  challengeId: { type: String },
  memberId: { type: String },
  handle: { type: String },
  aggregateScore: { type: Number },
  testsPassed: { type: Number },
  scoreLevel: { type: String },
  totalTestCases: { type: Number },
  groupIds: { type: [String] }
})

module.exports = LeaderboardSchema
