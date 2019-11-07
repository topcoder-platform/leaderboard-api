/**
 * Initialize database tables. All data will be cleared.
 */
require('./bootstrap')
const { Leaderboard } = require('./models')
const logger = require('./common/logger')

logger.info('Initialize database tables.')

const initDB = async () => {
  // clear data
  await Leaderboard.deleteMany({})
}

if (!module.parent) {
  initDB().then(() => {
    logger.info('Done!')
    process.exit()
  }).catch((e) => {
    logger.logFullError(e)
    process.exit(1)
  })
}

module.exports = {
  initDB
}
