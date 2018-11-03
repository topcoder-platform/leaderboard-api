/**
 * The application API routes
 */

module.exports = {
  '/leaderboard': {
    get: {
      controller: 'LeaderboardController',
      method: 'getLeaderboard'
    }
  },
  '/health': {
    get: {
      controller: 'HealthCheckController',
      method: 'checkHealth'
    }
  }
}