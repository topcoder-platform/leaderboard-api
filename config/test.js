/**
 * Configuration file to be used while running tests
 */

module.exports = {
  MONGODB_URL: process.env.TEST_MONGODB_URL || 'mongodb://localhost:27017/leaderboardTestDB'
}
