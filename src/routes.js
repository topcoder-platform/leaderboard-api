/**
 * The application API routes
 */

module.exports = {
  '/leaderboard': {
    get: {
      controller: 'LeaderboardController',
      method: 'searchLeaderboards'
    }
  },
  '/leaderboard/challenge/:challengeId/member/:memberId': {
    post: {
      controller: 'LeaderboardController',
      method: 'createLeaderboard'
    },
    patch: {
      controller: 'LeaderboardController',
      method: 'updateLeaderboard'
    }
  },
  '/leaderboard/review/:reviewId': {
    delete: {
      controller: 'LeaderboardController',
      method: 'deleteLeaderboard'
    }
  },
  '/health': {
    get: {
      controller: 'HealthCheckController',
      method: 'checkHealth'
    }
  }
}
