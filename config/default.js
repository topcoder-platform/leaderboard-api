/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,
  AUTH_SECRET: process.env.AUTH_SECRET || 'mysecret',
  VALID_ISSUERS: process.env.VALID_ISSUERS ? process.env.VALID_ISSUERS.replace(/\\"/g, '')
    : '["https://topcoder-dev.auth0.com/", "https://api.topcoder.com"]',

  CHALLENGE_API_URL: process.env.CHALLENGE_API_URL || 'https://api.topcoder-dev.com/v5/challenges',
  MEMBER_API_URL: process.env.MEMBER_API_URL || 'https://api.topcoder-dev.com/v5/members',

  SCORE_RESET_TIME: process.env.SCORE_RESET_TIME || 10000, // 10 seconds default

  AUTH0_URL: process.env.AUTH0_URL || 'https://topcoder-dev.auth0.com/oauth/token',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://m2m.topcoder-dev.com/',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME || 90,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL,

  AMAZON: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    DYNAMODB_READ_CAPACITY_UNITS: process.env.DYNAMODB_READ_CAPACITY_UNITS || 10,
    DYNAMODB_WRITE_CAPACITY_UNITS: process.env.DYNAMODB_WRITE_CAPACITY_UNITS || 5,
    IS_LOCAL_DB: process.env.IS_LOCAL_DB ? process.env.IS_LOCAL_DB === 'true' : false,
    // Below configuration is required if IS_LOCAL_DB is true
    DYNAMODB_URL: process.env.DYNAMODB_URL || 'http://localhost:8000'
  },
  HEALTH_CHECK_TIMEOUT: process.env.HEALTH_CHECK_TIMEOUT || 3000,

  BUSAPI_URL: process.env.BUSAPI_URL || 'https://api.topcoder-dev.com/v5',
  KAFKA_ERROR_TOPIC: process.env.KAFKA_ERROR_TOPIC || 'common.error.reporting',
  KAFKA_MESSAGE_ORIGINATOR: process.env.KAFKA_MESSAGE_ORIGINATOR || 'leaderboard-api',
  LEADERBOARD_CREATE_TOPIC: process.env.LEADERBOARD_CREATE_TOPIC || 'leaderboard.action.create',
  LEADERBOARD_UPDATE_TOPIC: process.env.LEADERBOARD_UPDATE_TOPIC || 'leaderboard.action.update',
  LEADERBOARD_DELETE_TOPIC: process.env.LEADERBOARD_DELETE_TOPIC || 'leaderboard.action.delete',
  LEADERBOARD_AGGREGATE_TOPIC: process.env.LEADERBOARD_AGGREGATE_TOPIC || 'leaderboard.action.aggregate'
}
