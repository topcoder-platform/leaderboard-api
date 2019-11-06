/**
 * Leaderboard retrieval service
 */

const _ = require('lodash')
const joi = require('joi')
const config = require('config')
const helper = require('../common/helper')
const logger = require('../common/logger')
const errors = require('../common/errors')
const { Leaderboard } = require('../models')

/**
 * Get leaderboard detail by challenge id and member id
 *
 * @param {String} challengeId the challenge id
 * @param {String} memberId the member id
 * @returns {Object} the leaderboard detail
 */
async function getLeaderboard (challengeId, memberId) {
  return Leaderboard.find({ $and: [{ challengeId }, { memberId }] })
}

/**
 * Returns the tests passed using the metadata information
 *
 * @param {object} metadata the object from which to retrieve the tests passed
 * @returns {Number} the test passed number
 */
function getTestsPassed (metadata) {
  const tests = metadata.assertions || {}

  let testsPassed = tests.total - tests.pending - tests.failed
  logger.log(`${tests.total} - ${tests.pending} - ${tests.failed} == ${testsPassed}`)
  if (!testsPassed) {
    testsPassed = 0
  }

  return testsPassed
}

/**
 * Calculate test passed number and total test cases
 *
 * @param {Object} reviewSummation the review summation
 * @return {Object} testsPassed and totalTestCases
 */
function calculateResult (reviewSummation) {
  let testsPassed = 0
  let totalTestCases = 0

  if (reviewSummation.metadata) {
    testsPassed = getTestsPassed(reviewSummation.metadata)
    totalTestCases = _.get(reviewSummation, 'metadata.tests.total', 0)
  }
  return { testsPassed, totalTestCases }
}

/**
 * Create leaderboard using review summation data
 *
 * @param {String} challengeId the challenge id
 * @param {String} memberId the member id
 * @param {Object} reviewSummation the review summation data
 * @returns {Object} the created leaderboard
 */
async function createLeaderboard (challengeId, memberId, reviewSummation) {
  const existRecords = await getLeaderboard(challengeId, memberId)
  if (existRecords.length > 0) {
    throw new errors.ConflictError(`Leaderboard record with challenge # ${challengeId} and member # ${memberId} already exists.`)
  }

  const { testsPassed, totalTestCases } = calculateResult(reviewSummation)

  const challengeDetailRes = await helper.reqToAPI(
    `${config.CHALLENGE_API_URL}?filter=id=${challengeId}`)
  const challenge = _.get(challengeDetailRes, 'body.result.content[0]')
  if (!challenge) {
    throw new errors.BadRequestError(`Challenge # ${challengeId} doesn't exist`)
  }

  const groupIds = challenge.groupIds
  if (!helper.isGroupIdValid(groupIds)) {
    logger.debug(`Group ID (${JSON.stringify(groupIds)}) of Challenge # ${challengeId} is not in the configured set of Ids (${config.GROUP_IDS}) configured for processing!`)
    // Ignore the message
    return
  }

  const memberDetailRes = await helper.reqToAPI(`${config.MEMBER_API_URL}?filter=id=${memberId}`)
  const member = _.get(memberDetailRes, 'body.result.content[0]')
  if (!member) {
    throw new errors.BadRequestError(`Member # ${memberId} doesn't exist`)
  }

  // Record to be written into MongoDB
  const record = {
    reviewSummationId: reviewSummation.id,
    submissionId: reviewSummation.submissionId,
    memberId,
    challengeId,
    handle: member.handle,
    aggregateScore: reviewSummation.aggregateScore,
    testsPassed,
    totalTestCases,
    groupIds: _.map(groupIds, e => String(e))
  }

  return Leaderboard.create(record)
}

createLeaderboard.schema = {
  challengeId: joi.string().required(),
  memberId: joi.string().required(),
  reviewSummation: joi.object().keys({
    id: joi.string().required(),
    submissionId: joi.string().required(),
    aggregateScore: joi.number().required()
  }).unknown(true).required()
}

/**
 * Update leaderboard detail using review summation data
 *
 * @param {String} challengeId the challenge id
 * @param {String} memberId the member id
 * @param {Object} reviewSummation the review summation data
 * @returns the updated leaderboard detail
 */
async function updateLeaderboard (challengeId, memberId, reviewSummation) {
  const existRecords = await getLeaderboard(challengeId, memberId)
  if (existRecords.length === 0) {
    throw new errors.NotFoundError(`Leaderboard record with challenge # ${challengeId} and member # ${memberId} doesn't exist`)
  }

  const { testsPassed, totalTestCases } = calculateResult(reviewSummation)

  _.assignIn(existRecords[0], {
    aggregateScore: reviewSummation.aggregateScore,
    reviewSummationId: reviewSummation.id,
    testsPassed,
    totalTestCases
  })

  return existRecords[0].save()
}

updateLeaderboard.schema = {
  challengeId: joi.string().required(),
  memberId: joi.string().required(),
  reviewSummation: joi.object().keys({
    id: joi.string().required(),
    aggregateScore: joi.number().required()
  }).unknown(true).required()
}

/**
 * Get leaderboard for the given challengeId
 *
 * @param {filter} Filters to be used in Database
 * @returns {Object} Leaderboard data for the given challengeId
 */
async function searchLeaderboards (filter) {
  if (filter.challengeId && filter.groupId) {
    throw new errors.BadRequestError(`You can't filter the result using both challengeId and groupId filter.`)
  }
  if (filter.challengeId && filter.memberId) {
    // at most one record return
    return getLeaderboard(filter.challengeId, filter.memberId)
  }
  if (filter.challengeId) {
    return Leaderboard.find({ challengeId: filter.challengeId })
      .sort({ aggregateScore: -1 })
      .skip((filter.page - 1) * filter.perPage)
      .limit(filter.perPage)
  } else if (filter.groupId) {
    const leaderboards = await Leaderboard.find({ groupIds: filter.groupId })
    const map = new Map()
    _.each(leaderboards, e => {
      if (!map.has(e.memberId)) {
        map.set(e.memberId, {
          numberOfChallenges: 0,
          finalAggregationScore: 0,
          totalTests: 0,
          totalTestsPassed: 0,
          memberId: e.memberId,
          memberHandle: e.handle
        })
      }
      map.get(e.memberId).finalAggregationScore += e.aggregateScore
      map.get(e.memberId).totalTestsPassed += e.testsPassed
      map.get(e.memberId).totalTests += e.totalTestCases
      map.get(e.memberId).numberOfChallenges += 1
    })
    const result = Array.from(map.values())
    _.each(result, e => {
      e.finalAggregationScore = e.finalAggregationScore / e.numberOfChallenges
    })
    result.sort((a, b) => b.finalAggregationScore - a.finalAggregationScore)
    return result.slice((filter.page - 1) * filter.perPage, filter.page * filter.perPage)
  } else {
    throw new errors.BadRequestError(`Either challengeId or groupId filter should be provided.`)
  }
}

searchLeaderboards.schema = {
  filter: joi.object().keys({
    challengeId: joi.alternatives().try(joi.id(), joi.string().uuid()),
    memberId: joi.string(),
    groupId: joi.string(),
    page: joi.page(),
    perPage: joi.perPage()
  }).required()
}

/**
 * Delete leaderboard by review summation id.
 *
 * @param {String} reviewSummationId the review summation id
 */
async function deleteLeaderboard (reviewSummationId) {
  const entity = await Leaderboard.findOne({ reviewSummationId })
  if (!entity) {
    throw new errors.NotFoundError(`Leaderboard record with reviewSummation ID: ${reviewSummationId} doesn't exist`)
  }
  await entity.remove()
}

deleteLeaderboard.schema = {
  reviewSummationId: joi.string().required()
}

module.exports = {
  createLeaderboard,
  updateLeaderboard,
  searchLeaderboards,
  deleteLeaderboard
}

logger.buildService(module.exports)
