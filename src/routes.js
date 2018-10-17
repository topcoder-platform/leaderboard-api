/**
 * The application API routes
 */

module.exports = {
  '/leaderboard': {
    get: {
      controller: 'LeaderboardController',
      method: 'getLeaderboard'
    }
  }
}
