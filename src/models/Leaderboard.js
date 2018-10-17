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
  aggregateScore: { type: Number }
})

module.exports = {
  LeaderboardSchema
}
