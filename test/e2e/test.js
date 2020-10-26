/**
 * Mocha e2e tests of the Leaderboard API.
 */

process.env.NODE_ENV = 'test'
require('../../src/bootstrap')
const chai = require('chai')
const _ = require('lodash')
const expect = require('chai').expect
const chaiHttp = require('chai-http')
const logger = require('../../src/common/logger')
const { initDB } = require('../../scripts/init-db')
const { insertData } = require('../../scripts/test-data')
const { Leaderboard } = require('../../src/models')
const { expressApp } = require('../../src/app')
const { M2M_FULL_TOKEN } = require('../common/testData')

chai.use(chaiHttp)

describe('Topcoder - Leaderboard API E2E Tests', () => {
  let debugLogs = []
  const debug = logger.debug

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

  describe('Fail routes Tests', () => {
    it('Unsupported http method, return 405', async () => {
      const res = await chai.request(expressApp)
        .put('/v5/leaderboard')
        .send({})

      expect(res.status).to.equal(405)
      expect(res.body.message).to.equal('The requested HTTP method is not supported.')
    })

    it('Http resource not found, return 404', async () => {
      const res = await chai.request(expressApp)
        .get('/v5/invalid')

      expect(res.status).to.equal(404)
      expect(res.body.message).to.equal('The requested resource cannot be found.')
    })
  })

  describe('Health Test', () => {
    it('Health endpoint, return 200', async () => {
      const res = await chai.request(expressApp)
        .get('/v5/health')

      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({ checksRun: 1 })
    })
  })

  describe('search leaderboards test', () => {
    it('search leaderboard with challengeId and memberId success', async () => {
      const res = await chai.request(expressApp)
        .get('/v5/leaderboard?challengeId=30104644&memberId=123456')

      expect(res.status).to.equal(200)
      expect(res.body.length).to.equal(1)
    })

    it('search leaderboard with challengeId success', async () => {
      const res = await chai.request(expressApp)
        .get('/v5/leaderboard?challengeId=30104644&page=2&perPage=2')

      expect(res.status).to.equal(200)
      const result = res.body
      expect(result.length).to.equal(1)
      expect(result[0]).to.deep.equal({
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
      const res = await chai.request(expressApp)
        .get('/v5/leaderboard?groupId=100')

      expect(res.status).to.equal(200)
      const result = res.body
      expect(result.length).to.equal(3)
      expect(result[0]).to.contain({
        numberOfChallenges: 3,
        finalAggregationScore: 330,
        totalTests: 36,
        totalTestsPassed: 22,
        memberId: '123456',
        memberHandle: 'user1'
      })
      expect(result[1]).to.contain({
        numberOfChallenges: 2,
        finalAggregationScore: 280,
        totalTests: 16,
        totalTestsPassed: 13,
        memberId: '123458',
        memberHandle: 'user3'
      })
      expect(result[2]).to.contain({
        numberOfChallenges: 2,
        finalAggregationScore: 140,
        totalTests: 30,
        totalTestsPassed: 19,
        memberId: '123457',
        memberHandle: 'user2'
      })
    })

    it('search leaderboard with groupId 200 success', async () => {
      const res = await chai.request(expressApp)
        .get('/v5/leaderboard?groupId=200&perPage=1')

      expect(res.status).to.equal(200)
      const result = res.body
      expect(result.length).to.equal(1)
      expect(result[0]).to.contain({
        numberOfChallenges: 2,
        finalAggregationScore: 140,
        totalTests: 30,
        totalTestsPassed: 18,
        memberId: '123456',
        memberHandle: 'user1'
      })
    })

    it('failure - search leaderboard without filter', async () => {
      const res = await chai.request(expressApp)
        .get('/v5/leaderboard')

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('Either challengeId or groupId filter should be provided.')
    })

    it('failure - search leaderboard with both challengeId and groupId', async () => {
      const res = await chai.request(expressApp)
        .get('/v5/leaderboard?challengeId=1&groupId=1')

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal(`You can't filter the result using both challengeId and groupId filter.`)
    })
  })

  describe('create leaderboard test', () => {
    it('create leaderboard success 1', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/30051825/member/8547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '161d3655-9c80-4f90-8051-e209e8c21701',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21701',
          score: 0
        })

      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({
        groupIds: [ '20000000' ],
        reviewId: '161d3655-9c80-4f90-8051-e209e8c21701',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21701',
        memberId: '8547899',
        challengeId: '30051825',
        scoreLevel: '',
        handle: 'TonyJ',
        aggregateScore: 0,
        testsPassed: 0,
        totalTestCases: 0
      })
    })

    it('create leaderboard success 2', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/30051826/member/8547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '161d3655-9c80-4f90-8051-e209e8c21702',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21702',
          metadata: {
            tests: {
              pending: 0,
              failed: 1,
              total: 10
            }
          },
          score: 90
        })

      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({
        groupIds: [ '202343', '20000000' ],
        reviewId: '161d3655-9c80-4f90-8051-e209e8c21702',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21702',
        memberId: '8547899',
        challengeId: '30051826',
        scoreLevel: '',
        handle: 'TonyJ',
        aggregateScore: 90,
        testsPassed: 9,
        totalTestCases: 10
      })
    })

    it('create leaderboard with invalid metadata 1', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/30051825/member/22688726')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
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

      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({
        groupIds: [ '20000000' ],
        reviewId: '161d3655-9c80-4f90-8051-e209e8c21703',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21703',
        memberId: '22688726',
        challengeId: '30051825',
        scoreLevel: '',
        handle: 'vasyl',
        aggregateScore: 0,
        testsPassed: 0,
        totalTestCases: 0
      })
    })

    it('create leaderboard with invalid metadata 2', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/30051826/member/22688726')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '161d3655-9c80-4f90-8051-e209e8c21704',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21704',
          metadata: { },
          score: 0
        })

      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({
        groupIds: [ '202343', '20000000' ],
        reviewId: '161d3655-9c80-4f90-8051-e209e8c21704',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21704',
        memberId: '22688726',
        challengeId: '30051826',
        scoreLevel: '',
        handle: 'vasyl',
        aggregateScore: 0,
        testsPassed: 0,
        totalTestCases: 0
      })
    })

    it('failure - create leaderboard with incorrect challenge', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/30000001/member/8547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '161d3655-9c80-4f90-8051-e209e8c21705',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21705',
          score: 50
        })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal(`Challenge # 30000001 doesn't exist`)
    })

    it('failure - create leaderboard with incorrect member', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/30051826/member/10000')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '161d3655-9c80-4f90-8051-e209e8c21706',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21706',
          score: 50
        })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal(`Member # 10000 doesn't exist`)
    })

    it('failure - create leaderboard already exists', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/30051825/member/8547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '161d3655-9c80-4f90-8051-e209e8c21701',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21701',
          score: 0
        })

      expect(res.status).to.equal(409)
      expect(res.body.message).to.equal(`Leaderboard record with challenge # 30051825 and member # 8547899 already exists.`)
    })

    it('failure - create leaderboard with invalid parameter 1', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/30051825/member/8547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21701',
          aggregateScore: 0
        })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"id" is required')
    })

    it('failure - create leaderboard with invalid parameter 2', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/30051825/member/8547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '161d3655-9c80-4f90-8051-e209e8c21707',
          aggregateScore: 0
        })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"submissionId" is required')
    })

    it('failure - create leaderboard with invalid parameter 3', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/30051825/member/8547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '161d3655-9c80-4f90-8051-e209e8c21707',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21701'
        })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"score" is required')
    })

    it('ignore - create leaderboard with ignored challenge', async () => {
      const res = await chai.request(expressApp)
        .post('/v5/leaderboard/challenge/31000000/member/22688726')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '161d3655-9c80-4f90-8051-e209e8c21707',
          submissionId: '261d3655-9c80-4f90-8051-e209e8c21707',
          score: 50
        })
      expect(res.status).to.equal(204)
      expect(debugLogs[3]).to.equal('Group ID (["30000"]) of Challenge # 31000000 is not in the approved list. Ignoring request')
    })
  })

  describe('update leaderboard test', () => {
    it('update leaderboard success', async () => {
      const res = await chai.request(expressApp)
        .patch('/v5/leaderboard/challenge/30051825/member/8547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '361d3655-9c80-4f90-8051-e209e8c21701',
          metadata: {
            tests: {
              pending: 0,
              failed: 1,
              total: 5
            }
          },
          score: 80
        })

      expect(res.status).to.equal(200)
      expect(res.body).to.deep.contain({
        groupIds: ['20000000'],
        reviewId: '361d3655-9c80-4f90-8051-e209e8c21701',
        submissionId: '261d3655-9c80-4f90-8051-e209e8c21701',
        memberId: '8547899',
        challengeId: '30051825',
        handle: 'TonyJ',
        aggregateScore: 80,
        testsPassed: 4,
        totalTestCases: 5,
        scoreLevel: 'up'
      })
      expect(_.isNumber(res.body.scoreResetTime)).to.equal(true)
    })

    it('failure - update leaderboard not found', async () => {
      const res = await chai.request(expressApp)
        .patch('/v5/leaderboard/challenge/30051825/member/5547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '361d3655-9c80-4f90-8051-e209e8c21701',
          score: 80
        })

      expect(res.status).to.equal(404)
      expect(res.body.message).to.equal(`Leaderboard record with challenge # 30051825 and member # 5547899 doesn't exist`)
    })

    it('failure - update leaderboard with invalid parameter 1', async () => {
      const res = await chai.request(expressApp)
        .patch('/v5/leaderboard/challenge/30051825/member/8547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          aggregateScore: 0
        })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"id" is required')
    })

    it('failure - update leaderboard with invalid parameter 2', async () => {
      const res = await chai.request(expressApp)
        .patch('/v5/leaderboard/challenge/30051825/member/8547899')
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
        .send({
          id: '161d3655-9c80-4f90-8051-e209e8c21707'
        })

      expect(res.status).to.equal(400)
      expect(res.body.message).to.equal('"score" is required')
    })
  })

  describe('delete leaderboard test', () => {
    const id = '661d3655-9c80-4f90-8051-e209e8c21704'

    it('delete leaderboard success', async () => {
      const res = await chai.request(expressApp)
        .delete(`/v5/leaderboard/review/${id}`)
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)

      expect(res.status).to.equal(204)
      const result = await Leaderboard.query({ reviewId: id }).exec()
      expect(result.length).to.equal(0)
    })

    it('failure - delete leaderboard not found', async () => {
      const res = await chai.request(expressApp)
        .delete(`/v5/leaderboard/review/${id}`)
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)

      expect(res.status).to.equal(404)
      expect(res.body.message).to.equal(`Leaderboard record with review id: ${id} doesn't exist`)
    })
  })

  describe('search groups test', async () => {
    it('search groups success', async () => {
      const res = await chai.request(expressApp)
        .get(`/v5/leaderboard/groups`)
      expect(res.status).to.equal(200)
      expect(res.body).to.eql(['202343', '100', '20000000', '200'])
    })
  })

  describe('create group test', async () => {
    it('create group success', async () => {
      const groupId = '300'
      const res = await chai.request(expressApp)
        .post(`/v5/leaderboard/groups/${groupId}`)
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
      expect(res.status).to.equal(200)
      expect(res.body).to.eql({ groupId })
    })
    it('failure - group wth specified groupId already exist', async () => {
      const groupId = '300'
      const res = await chai.request(expressApp)
        .post(`/v5/leaderboard/groups/${groupId}`)
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
      expect(res.status).to.equal(409)
      expect(res.body).to.eql({ message: `groupId # ${groupId} already exists.` })
    })
  })

  describe('delete group test', async () => {
    it('delete group success', async () => {
      const groupId = '300'
      const res = await chai.request(expressApp)
        .delete(`/v5/leaderboard/groups/${groupId}`)
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
      expect(res.status).to.equal(204)
    })
    it('failure - group with specified groupId does not exist', async () => {
      const groupId = '300'
      const res = await chai.request(expressApp)
        .delete(`/v5/leaderboard/groups/${groupId}`)
        .set('Authorization', `Bearer ${M2M_FULL_TOKEN}`)
      expect(res.status).to.equal(404)
      expect(res.body).to.eql({ message: `groupId # ${groupId} doesn't exist` })
    })
  })
})
