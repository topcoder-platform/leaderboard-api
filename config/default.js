/**
 * The configuration file.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,
  AUTH_SECRET: process.env.AUTH_SECRET || 'mysecret',
  VALID_ISSUERS: process.env.VALID_ISSUERS ? process.env.VALID_ISSUERS.replace(/\\"/g, '')
    : '["https://topcoder-dev.auth0.com/", "https://api.topcoder.com"]',

  MONGODB_URL: process.env.MONGODB_URL || 'mongodb://localhost:27017/leaderboardDB',
  CHALLENGE_API_URL: process.env.CHALLENGE_API_URL || 'https://api.topcoder-dev.com/v4/challenges',
  MEMBER_API_URL: process.env.MEMBER_API_URL || 'https://api.topcoder-dev.com/v3/users',

  GROUP_IDS: process.env.GROUP_IDS || '202343,20000000', // Comma separated string of Group IDs,

  SCORE_RESET_TIME: process.env.SCORE_RESET_TIME || 10000, // 10 seconds default

  AUTH0_URL: process.env.AUTH0_URL || 'https://topcoder-dev.auth0.com/oauth/token',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://m2m.topcoder-dev.com/',
  TOKEN_CACHE_TIME: process.env.TOKEN_CACHE_TIME || 90,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '8QovDh27SrDu1XSs68m21A1NBP8isvOt',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || '3QVxxu20QnagdH-McWhVz0WfsQzA1F8taDdGDI4XphgpEYZPcMTF4lX3aeOIeCzh',
  AUTH0_PROXY_SERVER_URL: process.env.AUTH0_PROXY_SERVER_URL
}
