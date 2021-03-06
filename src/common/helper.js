/**
 * Contains generic helper methods
 */

const _ = require('lodash')
const config = require('config')
const request = require('superagent')
const models = require('../models')
const logger = require('./logger')
const m2mAuth = require('tc-core-library-js').auth.m2m
const busApi = require('tc-bus-api-wrapper')

const m2m = m2mAuth(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME', 'AUTH0_PROXY_SERVER_URL']))

const busApiClient = busApi(_.pick(config, ['AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME', 'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET', 'BUSAPI_URL', 'KAFKA_ERROR_TOPIC', 'AUTH0_PROXY_SERVER_URL']))

// mapping operation to topic
const OP_TO_TOPIC = {
  create: config.LEADERBOARD_CREATE_TOPIC,
  update: config.LEADERBOARD_UPDATE_TOPIC,
  delete: config.LEADERBOARD_DELETE_TOPIC
}

/*
 * Check if the Group ID is configured to be processed
 * @param {String []} groupIds Array of group ID
 * @returns {Boolean} True if any one of the Group ID is present in config
 */
const isGroupIdValid = async (groupIds) => {
  // Get the Group IDs from config
  const confGroupIds = _.map(await models.Group.scan().all().exec(), (group) => group.groupId)
  if (_.intersection(confGroupIds, groupIds).length !== 0) {
    return true
  }
  return false
}

/*
 * Function to get M2M token
 * @returns {Promise}
 */
const getM2Mtoken = async () => {
  return m2m.getMachineToken(config.AUTH0_CLIENT_ID, config.AUTH0_CLIENT_SECRET)
}

/*
 * Send GET request to any API with M2M token
 * @param {String} path HTTP URL
 * @returns {Promise}
 */
const reqToAPI = async (path) => {
  const token = await getM2Mtoken()
  return request
    .get(path)
    .set('Authorization', `Bearer ${token}`)
    .set('Content-Type', 'application/json')
}

/**
 * Wrap async function to standard express function
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 */
const wrapExpress = fn => (req, res, next) => {
  fn(req, res, next).catch(next)
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
const autoWrapExpress = (obj) => {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'AsyncFunction') {
      return wrapExpress(obj)
    }
    return obj
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value)
  })
  return obj
}

/**
 * Posts the message to bus api
 * @param {String} op The action
 * @param {String} resource The name of the resource
 * @param {Object} result The payload
 */
async function publishMessage (op, resource, result) {
  logger.debug(`Publishing message to bus: resource ${resource}, data ${JSON.stringify(result, null, 2)}`)
  const topic = OP_TO_TOPIC[op]
  const payload = _.assign({ resource }, result)
  if (!OP_TO_TOPIC[op]) {
    logger.warn(`Invalid operation: ${op}`)
    return
  }

  logger.debug(`Posting event to Kafka topic ${topic}, ${JSON.stringify(payload, null, 2)}`)
  const message = {
    topic,
    originator: config.KAFKA_MESSAGE_ORIGINATOR,
    timestamp: new Date().toISOString(),
    'mime-type': 'application/json',
    payload
  }
  await busApiClient.postEvent(message)

  // Post to the aggregate topic
  message.payload.originalTopic = topic
  message.topic = config.LEADERBOARD_AGGREGATE_TOPIC
  logger.debug(`Posting event to aggregate topic ${message.topic}`)
  await busApiClient.postEvent(message)
}

module.exports = {
  isGroupIdValid,
  reqToAPI,
  wrapExpress,
  autoWrapExpress,
  publishMessage
}
