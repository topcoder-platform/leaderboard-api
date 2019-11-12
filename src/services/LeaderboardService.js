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

const timers = {}
const challengesInGroups = {}

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
  const tests = metadata.tests || { total: 0, pending: 0, failed: 0 }

  let testsPassed = tests.total - tests.pending - tests.failed

  if (!testsPassed) {
    testsPassed = 0
  }

  return testsPassed
}

/**
 * Calculate test passed number and total test cases
 *
 * @param {Object} review the review
 * @return {Object} testsPassed and totalTestCases
 */
function calculateResult (review) {
  let testsPassed = 0
  let totalTestCases = 0

  if (review.metadata) {
    testsPassed = getTestsPassed(review.metadata)
    totalTestCases = _.get(review, 'metadata.tests.total', 0)
  }
  return { testsPassed, totalTestCases }
}

/**
 * Create leaderboard using review data
 *
 * @param {String} challengeId the challenge id
 * @param {String} memberId the member id
 * @param {Object} review the review data
 * @returns {Object} the created leaderboard
 */
async function createLeaderboard (challengeId, memberId, review) {
  let scoreLevel = ''
  const existRecords = await getLeaderboard(challengeId, memberId)
  if (existRecords.length > 0) {
    throw new errors.ConflictError(`Leaderboard record with challenge # ${challengeId} and member # ${memberId} already exists.`)
  }

  const { testsPassed, totalTestCases } = calculateResult(review)

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

  if (review.status === 'queued') {
    scoreLevel = 'queued'
  }

  // Record to be written into MongoDB
  const record = {
    reviewId: review.id,
    submissionId: review.submissionId,
    memberId,
    challengeId,
    handle: member.handle,
    aggregateScore: review.score, // For TCO scenario, we will only have 1 review - per member and per challenge
    status: review.status,
    testsPassed,
    totalTestCases,
    scoreLevel,
    groupIds: _.map(groupIds, e => String(e))
  }

  return Leaderboard.create(record)
}

createLeaderboard.schema = {
  challengeId: joi.string().required(),
  memberId: joi.string().required(),
  review: joi.object().keys({
    id: joi.string().required(),
    submissionId: joi.string().required(),
    score: joi.number().required()
  }).unknown(true).required()
}

/**
 * If the app gets restarted, this function will handle incomplete resets
 */
async function resetIncompleteScoreLevels () {
  // find records where scoreLevel doesn't equal ('' and 'queued') and scoreResetTime doesn't equal null
  const existRecords = await Leaderboard.find({
    $and: [
      { $and: [{ scoreLevel: { $ne: '' } }, { scoreLevel: { $ne: 'queued' } }] },
      { scoreResetTime: { $ne: null } }
    ]
  })
  _.forEach(existRecords, (record) => {
    const currentTime = Date.now()
    // if reset time already passed, reset immediately
    // otherwise wait for the necessary time
    if (currentTime >= record.scoreResetTime) {
      resetScoreLevel(record)
    } else {
      const timerKey = `${record.challengeId}:${record.memberId}`
      timers[timerKey] = setTimeout(resetScoreLevel, record.scoreResetTime - currentTime, record)
    }
  })
}

/**
 * Resets the scoreLevel back to an empty string
 * Resets the scoreResetTime to null
 *
 * @param {Object} record Mongoose record
 */
async function resetScoreLevel (record) {
  _.assignIn(record, {
    scoreLevel: '',
    scoreResetTime: null
  })
  record.save()
  const timerKey = `${record.challengeId}:${record.memberId}`
  delete timers[timerKey]
}

/**
 * Resets the scoreLevel back to an empty string
 * Resets the scoreResetTime to null
 *
 * @param {String} challengeId the challenge id
 * @param {String} memberId the member id
 */
async function resetScoreLevelWithMemberInfo (challengeId, memberId) {
  const existRecords = await getLeaderboard(challengeId, memberId)
  if (existRecords.length > 0) {
    resetScoreLevel(existRecords[0])
  }
}

/**
 * Update leaderboard detail using review data
 *
 * @param {String} challengeId the challenge id
 * @param {String} memberId the member id
 * @param {Object} review the review data
 * @returns the updated leaderboard detail
 */
async function updateLeaderboard (challengeId, memberId, review) {
  const existRecords = await getLeaderboard(challengeId, memberId)
  if (existRecords.length === 0) {
    throw new errors.NotFoundError(`Leaderboard record with challenge # ${challengeId} and member # ${memberId} doesn't exist`)
  }

  let scoreLevel = ''
  // when the score should be reset - incomplete timers will be reloaded on restart
  let scoreResetTime = null

  const { testsPassed, totalTestCases } = calculateResult(review)

  let scoreLevelChanged = false

  if (review.status !== 'queued') {
    if (existRecords[0].aggregateScore > review.score) {
      scoreLevel = 'down'
      scoreLevelChanged = true
    } else if (existRecords[0].aggregateScore < review.score) {
      scoreLevel = 'up'
      scoreLevelChanged = true
    }

    if (scoreLevelChanged) {
      const timerKey = `${challengeId}:${memberId}`
      // if we got a new review for the same challengeId:memberId, reset the timer
      clearTimeout(timers[timerKey])
      // resets the score after an amount of time
      timers[timerKey] = setTimeout(resetScoreLevelWithMemberInfo, config.SCORE_RESET_TIME, challengeId, memberId)
      scoreResetTime = Date.now() + config.SCORE_RESET_TIME
    }
  } else {
    scoreLevel = 'queued'
  }

  _.assignIn(existRecords[0], {
    aggregateScore: review.score,
    reviewId: review.id,
    testsPassed,
    totalTestCases,
    scoreLevel,
    scoreResetTime,
    status: review.status
  })

  return existRecords[0].save()
}

updateLeaderboard.schema = {
  challengeId: joi.string().required(),
  memberId: joi.string().required(),
  review: joi.object().keys({
    id: joi.string().required(),
    score: joi.number().required()
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
    let count
    if (challengesInGroups[filter.groupId]) {
      count = challengesInGroups[filter.groupId]
    } else {
      const challengeDetailRes = await helper.reqToAPI(
        `${config.CHALLENGE_API_URL}?filter=groupIds=${filter.groupId}`)
      count = _.get(challengeDetailRes, 'body.result.content', ['prevent divide by zero']).length
      // cache the count since Challenge API is too slow
      challengesInGroups[filter.groupId] = count
    }
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
          memberHandle: e.handle,
          reviews: []
        })
      }
      map.get(e.memberId).finalAggregationScore += e.aggregateScore
      map.get(e.memberId).totalTestsPassed += e.testsPassed
      map.get(e.memberId).totalTests += e.totalTestCases
      map.get(e.memberId).numberOfChallenges += 1
      map.get(e.memberId).reviews.push(e)
    })
    const result = Array.from(map.values())
    _.each(result, e => {
      e.finalAggregationScore = e.finalAggregationScore / count
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
 * Delete leaderboard by review id.
 *
 * @param {String} reviewId the review id
 */
async function deleteLeaderboard (reviewId) {
  const entity = await Leaderboard.findOne({ reviewId })
  if (!entity) {
    throw new errors.NotFoundError(`Leaderboard record with review id: ${reviewId} doesn't exist`)
  }
  await entity.remove()
}

deleteLeaderboard.schema = {
  reviewId: joi.string().required()
}

module.exports = {
  createLeaderboard,
  updateLeaderboard,
  searchLeaderboards,
  deleteLeaderboard,
  resetIncompleteScoreLevels
}

logger.buildService(module.exports)
