/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,

  MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/leaderboardDB'
}
