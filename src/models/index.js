/**
 * Initialize MongoDB models
 */

const config = require('config')
const db = require('../datasource').getDb(config.MONGODB_URL)

const { LeaderboardSchema } = require('./Leaderboard')

module.exports = {
  Leaderboard: db.model('Leaderboard', LeaderboardSchema)
}
