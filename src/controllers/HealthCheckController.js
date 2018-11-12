/**
 * Health Check Controller
 */

const config = require('config')
const db = require('../datasource').getDb(config.MONGODB_URL)

/**
 * Check for health of the app
 * @param req the request
 * @param res the response
 */
async function checkHealth (req, res) {
  if (db.readyState === 1) {
    res.status(200).json({
      checksRun: 1
    })

    return
  }

  res.status(503).json({
    checksRun: 1
  })
}

module.exports = {
  checkHealth
}
