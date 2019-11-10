/**
 * Test configuration file
 */

module.exports = {
  CHALLENGE_API_URL: 'https://api.topcoder-dev.com/v4/challenges',
  MEMBER_API_URL: 'https://api.topcoder-dev.com/v3/users',
  MOCK_API_PORT: 3001,
  MONGODB_URL: process.env.TEST_MONGODB_URL || 'mongodb://localhost:27017/leaderboardDB_test'
}
