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

/**
 * Get leaderboard detail by challenge id and member id
 *
 * @param {String} challengeId the challenge id
 * @param {String} memberId the member id
 * @returns {Object} the leaderboard detail
 */
async function getLeaderboard (challengeId, memberId) {
  return Leaderboard.query({ challengeId, memberId }).exec()
}

/**
 * Returns the tests passed using the metadata information
 *
 * @param {object} metadata the object from which to retrieve the tests passed
 * @returns {Number} the test passed number
 */
function getTestsPassed (metadata) {
  const tests = metadata.tests || { total: 0, pending: 0, failed: 0 }

  // MM scorer has passed tests count in the review already. Use it directly if it exists
  let testsPassed = tests.passed ? tests.passed : (tests.total - tests.pending - tests.failed)

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
    `${config.CHALLENGE_API_URL}?legacyId=${challengeId}`)
  const challenge = _.get(challengeDetailRes, 'body[0]')
  if (!challenge) {
    throw new errors.BadRequestError(`Challenge # ${challengeId} doesn't exist`)
  }

  const groupIds = challenge.groups
  if (!(await helper.isGroupIdValid(groupIds))) {
    logger.debug(`Group ID (${JSON.stringify(groupIds)}) of Challenge # ${challengeId} is not in the approved list. Ignoring request`)
    // Ignore the message
    return
  }

  const memberDetailRes = await helper.reqToAPI(`${config.MEMBER_API_URL}?userId=${memberId}&fields=userId,handle`)
  const member = _.get(memberDetailRes, 'body[0]')
  if (!member) {
    throw new errors.BadRequestError(`Member # ${memberId} doesn't exist`)
  }

  if (review.status === 'queued') {
    scoreLevel = 'queued'
  }

  // Record to be written into DynamoDB
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
    groupIds: _.map(groupIds, e => String(e)),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const dbEntity = await Leaderboard.create(record)
  try {
    await helper.publishMessage('create', 'leaderboard', record)
  } catch (err) {
    logger.logFullError(err)
  }

  return dbEntity
}

createLeaderboard.schema = {
  challengeId: joi.string().required(),
  memberId: joi.string().required(),
  review: joi.object().keys({
    id: joi.string().required(),
    submissionId: joi.string().required(),
    score: joi.number().required().allow(null)
  }).unknown(true).required()
}

/* istanbul ignore next */
/**
 * If the app gets restarted, this function will handle incomplete resets
 */
async function resetIncompleteScoreLevels () {
  // find records where scoreLevel doesn't equal ('' and 'queued') and scoreResetTime doesn't equal null
  const existRecords = await Leaderboard.scan()
    .where('scoreLevel').not().eq('')
    .and().where('scoreLevel').not().eq('queued')
    .and().filter('scoreResetTime').exists()
    .all().exec()
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
 * Delete the scoreResetTime(by setting its value to undefined)
 *
 * @param {Object} record Dynamoose record
 */
function resetScoreLevel (record) {
  _.assignIn(record, {
    scoreLevel: '',
    scoreResetTime: undefined
  })
  record.save()
  const timerKey = `${record.challengeId}:${record.memberId}`
  delete timers[timerKey]
}

/**
 * Resets the scoreLevel back to an empty string
 * Delete the scoreResetTime(by setting its value to undefined)
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
  let scoreResetTime

  const { testsPassed, totalTestCases } = calculateResult(review)

  let scoreLevelChanged = false

  if (review.resource === 'reviewSummation') {
    console.log('Updating leaderboard using review summation')
    if (!review.aggregateScore) {
      throw Error('Aggregate score is needed for the review summation')
    }
    _.assignIn(existRecords[0], {
      finalDetails: {
        aggregateScore: review.aggregateScore,
        testsPassed,
        totalTestCases
      }
    })
  } else {
    console.log('Updating leaderboard using review')
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
      finalDetails: {
        testsPassed,
        totalTestCases
      },
      aggregateScore: review.score?review.score:0,
      reviewId: review.id,
      testsPassed,
      totalTestCases,
      scoreLevel,
      scoreResetTime,
      status: review.status
    })
  }

  if (!existRecords[0].createdAt) {
    existRecords[0].createdAt = new Date().toISOString()
  }

  existRecords[0].updatedAt = new Date().toISOString()

  const dbEntity = await existRecords[0].save()
  try {
    await helper.publishMessage('update', 'leaderboard', existRecords[0])
  } catch (err) {
    logger.logFullError(err)
  }

  return dbEntity
}

updateLeaderboard.schema = {
  challengeId: joi.string().required(),
  memberId: joi.string().required(),
  review: joi.object().keys({
    id: joi.string().required(),
    score: joi.number().allow(null),
    aggregateScore: joi.number()
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
    const result = await Leaderboard.query({ challengeId: filter.challengeId }).all().exec()
    return _.orderBy(result, ['aggregateScore'], ['desc']).slice(
      (filter.page - 1) * filter.perPage,
      filter.perPage * filter.page
    )
  } else if (filter.groupId) {
    const leaderboards = await Leaderboard.scan({ groupIds: { contains: filter.groupId } }).all().exec()
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
    result.sort((a, b) => b.finalAggregationScore - a.finalAggregationScore)
    return result.slice((filter.page - 1) * filter.perPage, filter.page * filter.perPage)
  } else {
    throw new errors.BadRequestError(`Either challengeId or groupId filter should be provided.`)
  }
}

searchLeaderboards.schema = {
  filter: joi.object().keys({
    challengeId: joi.alternatives().try(joi.string(), joi.string().uuid()),
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
  const [entity] = await Leaderboard.query({ reviewId }).exec()
  if (!entity) {
    throw new errors.NotFoundError(`Leaderboard record with review id: ${reviewId} doesn't exist`)
  }
  await Leaderboard.delete(entity)

  try {
    await helper.publishMessage('delete', 'leaderboard', { reviewId })
  } catch (err) {
    logger.logFullError(err)
  }
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
