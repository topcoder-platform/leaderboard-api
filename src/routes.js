/**
 * The application API routes
 */

module.exports = {
  '/v5/leaderboard': {
    get: {
      controller: 'LeaderboardController',
      method: 'getLeaderboard'
    }
  },
  '/v5/health': {
    get: {
      controller: 'HealthCheckController',
      method: 'checkHealth'
    }
  }
}