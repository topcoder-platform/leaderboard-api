/**
 * Test cases for Leaderboard service
 */

const chai = require('chai')
const service = require('../src/services/LeaderboardService')
const testData = require('./testData')
const { Leaderboard } = require('../src/models')

chai.should()
chai.use(require('chai-as-promised'))

describe('Leaderboard Service Tests', () => {
  // Clean database before execution and insert test records
  before(async () => {
    await Leaderboard.deleteMany({})
    await Leaderboard.create(testData.testMongoRecord)
  })

  after(async () => {
    await Leaderboard.deleteMany({})
  })

  it('Leaderboard Service - Passing empty filter should throw error', async () => {
    return service.getLeaderboard(null).should.be.rejectedWith('"filter" must be an object')
  })

  it('Leaderboard Service - Filter without challengeId should throw error', async () => {
    return service.getLeaderboard({}).should.be.rejectedWith('"challengeId" is required')
  })

  it('Leaderboard Service - Passing valid challengeId throw return data', async () => {
    const data = await service.getLeaderboard({ challengeId: testData.testMongoRecord.challengeId })
    data.should.be.an('array')
    data.length.should.be.eql(1)
    data[0].reviewSummationId.should.be.eql(testData.testMongoRecord.reviewSummationId)
    data[0].submissionId.should.be.eql(testData.testMongoRecord.submissionId)
    data[0].memberId.should.be.eql(testData.testMongoRecord.memberId.toString())
    data[0].challengeId.should.be.eql(testData.testMongoRecord.challengeId.toString())
    data[0].handle.should.be.eql(testData.testMongoRecord.handle)
    data[0].aggregateScore.should.be.eql(testData.testMongoRecord.aggregateScore)
  })

  it('Leaderboard Service - Skipping one record should result in empty array', async () => {
    const data = await service.getLeaderboard({ challengeId: testData.testMongoRecord.challengeId, skip: 1 })
    data.should.be.an('array')
    data.length.should.be.eql(0)
  })
})
