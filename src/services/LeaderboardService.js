/**
 * Leaderboard retrieval service
 */

const joi = require('joi')
const logger = require('../common/logger')
const { Leaderboard } = require('../models')

/**
 * Get leaderboard for the given challengeId
 * @param {filter} Filters to be used in Database
 * @returns {Object} Leaderboard data for the given challengeId
 */
const getLeaderboard = async (filter) => {
  return Leaderboard.find({ challengeId: filter.challengeId }, '-_id -__v')
    .sort({ aggregateScore: -1 })
    .skip(filter.skip)
    .limit(filter.limit)
}

getLeaderboard.schema = {
  filter: joi.object().keys({
    challengeId: joi.alternatives().try(joi.id(), joi.string().uuid()).required(),
    skip: joi.id(),
    limit: joi.id()
  }).required()
}

module.exports = {
  getLeaderboard
}

logger.buildService(module.exports)
