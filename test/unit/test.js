/**
 * Mocha unit tests of the Leaderboard API.
 */

process.env.NODE_ENV = 'test'
require('../../src/bootstrap')
const _ = require('lodash')
const expect = require('chai').expect
const service = require('../../src/services/LeaderboardService')
const logger = require('../../src/common/logger')
const { initDB } = require('../../src/init-db')
const { insertData } = require('../../src/test-data')
const { Leaderboard } = require('../../src/models')

describe('Topcoder - Leaderboard API Unit Tests', () => {
  let debugLogs = []
  const debug = logger.debug

  /**
   * Assert Joi validation error
   * @param err the error
   * @param message the message
   */
  function assertValidationError (err, message) {
    expect(err.isJoi).to.equal(true)
    expect(err.name).to.equal('ValidationError')
    expect(err.details.map(x => x.message)).to.include(message)
  }

  before(async () => {
    // inject logger with log collector
    logger.debug = (message) => {
      debugLogs.push(message)
      debug(message)
    }

    await initDB()
    await insertData()
  })

  beforeEach(() => {
    debugLogs = []
  })

  after(async () => {
    // restore logger
    logger.debug = debug

    await initDB()
  })

  describe('search leaderboards test', () => {
    it('search leaderboard with challengeId and memberId success', async () => {
      const result = await service.searchLeaderboards({ challengeId: '30104644', memberId: '123456' })
      expect(result.length).to.equal(1)
    })

    it('search leaderboard with challengeId success', async () => {
      const result = await service.searchLeaderboards({ challengeId: '30104644', page: 2, perPage: 2 })
      expect(result.length).to.equal(1)
      expect(_.omit(result[0]._doc, ['__v', '_id'])).to.deep.equal({
        reviewId: '661d3655-9c80-4f90-8051-e209e8c21706',
        submissionId: '2b5e54b9-f03c-418b-92f3-5f072b0f3bf6',
        challengeId: '30104644',
        memberId: '123458',
        handle: 'user3',
        aggregateScore: 80,
        testsPassed: 8,
        totalTestCases: 10,
        groupIds: ['100', '200']
      })
    })

    it('search leaderboard with groupId 100 success', async () => {
      const result = await service.searchLeaderboards({ groupId: '100' })
      expect(result.length).to.equal(3)
      expect(result[0]).to.deep.equal({
        numberOfChallenges: 2,
        finalAggregationScore: 140,
        totalTests: 16,
        totalTestsPassed: 13,
        memberId: '123458',
        memberHandle: 'user3'
      })
      expect(result[1]).to.deep.equal({
        numberOfChallenges: 3,
        finalAggregationScore: 110,
        totalTests: 36,
        totalTestsPassed: 22,
        memberId: '123456',
        memberHandle: 'user1'
      })
      expect(result[2]).to.deep.equal({
        numberOfChallenges: 2,
        finalAggregationScore: 70,
        totalTests: 30,
        totalTestsPassed: 19,
        memberId: '123457',
        memberHandle: 'user2'
      })
    })

    it('search leaderboard with groupId 200 success', async () => {
      const result = await service.searchLeaderboards({ groupId: '200', perPage: 1 })
      expect(result.length).to.equal(1)
      expect(result[0]).to.deep.equal({
        numberOfChallenges: 1,
        finalAggregationScore: 80,
        totalTests: 10,
        totalTestsPassed: 8,
        memberId: '123458',
        memberHandle: 'user3'
      })
    })

    it('failure - search leaderboard without filter', async () => {
      try {
        await service.searchLeaderboards({})
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.message).to.equal('Either challengeId or groupId filter should be provided.')
      }
    })

    it('failure - search leaderboard with both challengeId and groupId', async () => {
      try {
        await service.searchLeaderboards({ challengeId: '1', groupId: '1' })
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.message).to.equal(`You can't filter the result using both challengeId and groupId filter.`)
      }
    })
  })

  describe('create leaderboard test', () => {
    it('create leaderboard success 1', async () => {
      const result = await service.createLeaderboard('30051825', '8547899', {
        id: '161d3655-9c80-4f90-8051-e209e8c21701',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21701',
        score: 0
      })
      expect(_.omit(result._doc, ['__v', '_id'])).to.deep.equal({
        groupIds: [ '20000000' ],
        reviewId: '161d3655-9c80-4f90-8051-e209e8c21701',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21701',
        memberId: '8547899',
        challengeId: '30051825',
        handle: 'TonyJ',
        aggregateScore: 0,
        testsPassed: 0,
        totalTestCases: 0
      })
    })

    it('create leaderboard success 2', async () => {
      const result = await service.createLeaderboard('30051826', '8547899', {
        id: '161d3655-9c80-4f90-8051-e209e8c21702',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21702',
        metadata: {
          assertions: {
            pending: 0,
            failed: 1,
            total: 10
          },
          tests: {
            total: 10
          }
        },
        score: 90
      })

      expect(_.omit(result._doc, ['__v', '_id'])).to.deep.equal({
        groupIds: [ '202343', '20000000' ],
        reviewId: '161d3655-9c80-4f90-8051-e209e8c21702',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21702',
        memberId: '8547899',
        challengeId: '30051826',
        handle: 'TonyJ',
        aggregateScore: 90,
        testsPassed: 9,
        totalTestCases: 10
      })
    })

    it('create leaderboard with invalid metadata 1', async () => {
      const result = await service.createLeaderboard('30051825', '22688726', {
        id: '161d3655-9c80-4f90-8051-e209e8c21703',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21703',
        metadata: {
          assertions: {
            pending: 1,
            failed: 1
          }
        },
        score: 0
      })

      expect(_.omit(result._doc, ['__v', '_id'])).to.deep.equal({
        groupIds: [ '20000000' ],
        reviewId: '161d3655-9c80-4f90-8051-e209e8c21703',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21703',
        memberId: '22688726',
        challengeId: '30051825',
        handle: 'vasyl',
        aggregateScore: 0,
        testsPassed: 0,
        totalTestCases: 0
      })
    })

    it('create leaderboard with invalid metadata 2', async () => {
      const result = await service.createLeaderboard('30051826', '22688726', {
        id: '161d3655-9c80-4f90-8051-e209e8c21704',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21704',
        metadata: { },
        score: 0
      })

      expect(_.omit(result._doc, ['__v', '_id'])).to.deep.equal({
        groupIds: [ '202343', '20000000' ],
        reviewId: '161d3655-9c80-4f90-8051-e209e8c21704',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21704',
        memberId: '22688726',
        challengeId: '30051826',
        handle: 'vasyl',
        aggregateScore: 0,
        testsPassed: 0,
        totalTestCases: 0
      })
    })

    it('failure - create leaderboard with incorrect challenge', async () => {
      try {
        await service.createLeaderboard('30000001', '8547899', {
          id: '161d3655-9c80-4f90-8051-e209e8c21705',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21705',
          score: 50
        })
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.message).to.equal(`Challenge # 30000001 doesn't exist`)
      }
    })

    it('failure - create leaderboard with incorrect member', async () => {
      try {
        await service.createLeaderboard('30051826', '10000', {
          id: '161d3655-9c80-4f90-8051-e209e8c21706',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21706',
          score: 50
        })
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.message).to.equal(`Member # 10000 doesn't exist`)
      }
    })

    it('failure - create leaderboard already exists', async () => {
      try {
        await service.createLeaderboard('30051825', '8547899', {
          id: '161d3655-9c80-4f90-8051-e209e8c21701',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21701',
          score: 0
        })
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.message).to.equal(`Leaderboard record with challenge # 30051825 and member # 8547899 already exists.`)
      }
    })

    it('failure - create leaderboard with invalid parameter 1', async () => {
      try {
        await service.createLeaderboard('30051825', '8547899', {
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21701',
          score: 0
        })
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"id" is required')
      }
    })

    it('failure - create leaderboard with invalid parameter 2', async () => {
      try {
        await service.createLeaderboard('30051825', '8547899', {
          id: '161d3655-9c80-4f90-8051-e209e8c21707',
          score: 0
        })
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"submissionId" is required')
      }
    })

    it('failure - create leaderboard with invalid parameter 3', async () => {
      try {
        await service.createLeaderboard('30051825', '8547899', {
          id: '161d3655-9c80-4f90-8051-e209e8c21707',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21701'
        })
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"score" is required')
      }
    })

    it('ignore - create leaderboard with ignored challenge', async () => {
      await service.createLeaderboard('31000000', '22688726', {
        id: '161d3655-9c80-4f90-8051-e209e8c21707',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21707',
        score: 50
      })
      expect(debugLogs[3]).to.equal('Group ID of Challenge # 31000000 is not configured for processing!')
    })
  })

  describe('update leaderboard test', () => {
    it('update leaderboard success', async () => {
      const result = await service.updateLeaderboard('30051825', '8547899', {
        id: '361d3655-9c80-4f90-8051-e209e8c21701',
        metadata: {
          assertions: {
            pending: 0,
            failed: 1,
            total: 5
          },
          tests: {
            total: 5
          }
        },
        score: 80
      })
      expect(_.omit(result._doc, ['__v', '_id'])).to.deep.equal({
        groupIds: [ '20000000' ],
        reviewId: '361d3655-9c80-4f90-8051-e209e8c21701',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21701',
        memberId: '8547899',
        challengeId: '30051825',
        handle: 'TonyJ',
        aggregateScore: 80,
        testsPassed: 4,
        totalTestCases: 5
      })
    })

    it('failure - update leaderboard not found', async () => {
      try {
        await service.updateLeaderboard('30051825', '5547899', {
          id: '361d3655-9c80-4f90-8051-e209e8c21701',
          score: 80
        })
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.message).to.equal(`Leaderboard record with challenge # 30051825 and member # 5547899 doesn't exist`)
      }
    })

    it('failure - update leaderboard with invalid parameter 1', async () => {
      try {
        await service.updateLeaderboard('30051825', '8547899', {
          score: 0
        })
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"id" is required')
      }
    })

    it('failure - update leaderboard with invalid parameter 2', async () => {
      try {
        await service.updateLeaderboard('30051825', '8547899', {
          id: '161d3655-9c80-4f90-8051-e209e8c21707'
        })
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"score" is required')
      }
    })
  })

  describe('delete leaderboard test', () => {
    const id = '661d3655-9c80-4f90-8051-e209e8c21704'

    it('delete leaderboard success', async () => {
      await service.deleteLeaderboard(id)
      const result = await Leaderboard.find({ reviewId: id })
      expect(result.length).to.equal(0)
    })

    it('failure - delete leaderboard not found', async () => {
      try {
        await service.deleteLeaderboard(id)
        throw new Error('should not throw error here')
      } catch (err) {
        expect(err.message).to.equal(`Leaderboard record with review id: ${id} doesn't exist`)
      }
    })

    it('failure - delete leaderboard invalid parameter', async () => {
      try {
        await service.deleteLeaderboard()
        throw new Error('should not throw error here')
      } catch (err) {
        assertValidationError(err, '"reviewId" is required')
      }
    })
  })
})
