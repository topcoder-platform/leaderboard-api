/**
 * The application API routes
 */

const constants = require('../app-constants')

module.exports = {
  '/leaderboards': {
    get: {
      controller: 'LeaderboardController',
      method: 'searchLeaderboards'
    }
  },
  '/leaderboards/challenge/:challengeId/member/:memberId': {
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
  '/leaderboards/review/:reviewId': {
    delete: {
      controller: 'LeaderboardController',
      method: 'deleteLeaderboard',
      auth: 'jwt',
      scopes: [constants.Scopes.LeaderboardDelete, constants.Scopes.LeaderboardAll]
    }
  },
  '/leaderboards/groups': {
    get: {
      controller: 'GroupController',
      method: 'searchGroups'
    }
  },
  '/leaderboards/groups/:groupId': {
    post: {
      controller: 'GroupController',
      method: 'createGroup',
      auth: 'jwt',
      scopes: [constants.Scopes.LeaderboardCreate, constants.Scopes.LeaderboardAll]
    },
    delete: {
      controller: 'GroupController',
      method: 'deleteGroup',
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
