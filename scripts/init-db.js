/**
 * Initialize database tables. All data will be cleared.
 */
require('../src/bootstrap')
const models = require('../src/models')
const logger = require('../src/common/logger')

logger.info('Initialize database tables.')

const initDB = async () => {
  // clear data
  for (const model of Object.values(models)) {
    const entities = await model.scan().all().exec()
    for (const item of entities) {
      await model.delete(item)
    }
  }
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
