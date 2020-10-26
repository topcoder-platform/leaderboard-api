/**
 * Controller for health check endpoint
 */
const config = require('config')
const models = require('../models')
const uuid = require('uuid')
const errors = require('../common/errors')

// the topcoder-healthcheck-dropin library returns checksRun count,
// here it follows that to return such count
let checksRun = 0
const randomReviewId = uuid.v4()

/**
 * Check health of the app
 * @param {Object} req the request
 * @param {Object} res the response
 */
async function checkHealth (req, res) {
  // perform a quick database access operation, if there is no error and is quick, then consider it healthy
  checksRun += 1
  await models.Leaderboard.query({ reviewId: randomReviewId }).limit(1).exec()
    .timeout(config.HEALTH_CHECK_TIMEOUT)
    .catch((e) => {
      if (e.name === 'TimeoutError') {
        throw new errors.ServiceUnavailableError('Database operation is slow.')
      }
      throw new errors.ServiceUnavailableError(`There is database operation error, ${e.message}`)
    })
  // there is no error, and it is quick, then return checks run count
  res.send({ checksRun })
}

module.exports = {
  checkHealth
}
