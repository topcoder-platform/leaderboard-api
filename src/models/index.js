/**
 * Initialize DynamoDB models
 */

const config = require('config')
const dynamoose = require('dynamoose')
const fs = require('fs')
const path = require('path')

dynamoose.aws.sdk.config.update({
//  accessKeyId: config.AMAZON.AWS_ACCESS_KEY_ID,
//  secretAccessKey: config.AMAZON.AWS_SECRET_ACCESS_KEY,
  region: config.AMAZON.AWS_REGION
})

if (config.AMAZON.IS_LOCAL_DB) {
  dynamoose.aws.ddb.local(config.AMAZON.DYNAMODB_URL)
}

dynamoose.model.defaults.set({
  create: false,
  update: false,
  waitForActive: false
})

const models = {}
fs.readdirSync(__dirname).forEach((file) => {
  if (file !== 'index.js') {
    const filename = file.split('.')[0]
    const schema = require(path.join(__dirname, filename))
    const model = dynamoose.model(`leaderboard_${filename}`, schema)
    models[filename] = model
  }
})

module.exports = models
