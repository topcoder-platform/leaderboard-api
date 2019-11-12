/**
 * The application API routes
 */

const constants = require('../app-constants')

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
      method: 'createLeaderboard',
      auth: 'jwt',
      scopes: [constants.Scopes.LeaderboardCreate, constants.Scopes.LeaderboardAll]
    },
    patch: {
      controller: 'LeaderboardController',
      method: 'updateLeaderboard',
      auth: 'jwt',
      scopes: [constants.Scopes.LeaderboardUpdate, constants.Scopes.LeaderboardAll]
    }
  },
  '/leaderboard/review/:reviewId': {
    delete: {
      controller: 'LeaderboardController',
      method: 'deleteLeaderboard',
      auth: 'jwt',
      scopes: [constants.Scopes.LeaderboardDelete, constants.Scopes.LeaderboardAll]
    }
  },
  '/health': {
    get: {
      controller: 'HealthCheckController',
      method: 'checkHealth'
    }
  }
}
