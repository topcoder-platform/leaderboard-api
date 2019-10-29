/**
 * Initialize MongoDB models
 */

const fs = require('fs')
const path = require('path')
const config = require('config')
const db = require('../datasource').getDb(config.MONGODB_URL)
const models = {}

// Bootstrap models
fs.readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') {
    const filename = file.split('.')[0]
    const schema = require(path.join(__dirname, filename))
    const model = db.model(filename, schema)
    models[filename] = model

    model.schema.options.toJSON = {
      transform: (doc, ret) => {
        delete ret._id
        delete ret.__v
        return ret
      }
    }
  }
})

module.exports = models
