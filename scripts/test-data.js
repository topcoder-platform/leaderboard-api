/**
 * Insert test data.
 */
require('../src/bootstrap')
const { Leaderboard, Group } = require('../src/models')
const logger = require('../src/common/logger')

const insertData = async () => {
  await Leaderboard.create({
    reviewId: '661d3655-9c80-4f90-8051-e209e8c21704',
    submissionId: '2b5e54b9-f03c-418b-92f3-5f072b0f3bf4',
    challengeId: '30104644',
    memberId: '123456',
    handle: 'user1',
    aggregateScore: 100,
    testsPassed: 10,
    totalTestCases: 10,
    groupIds: ['100', '200']
  })
  await Leaderboard.create({
    reviewId: '661d3655-9c80-4f90-8051-e209e8c21705',
    submissionId: '2b5e54b9-f03c-418b-92f3-5f072b0f3bf5',
    challengeId: '30104644',
    memberId: '123457',
    handle: 'user2',
    aggregateScore: 90,
    testsPassed: 9,
    totalTestCases: 10,
    groupIds: ['100', '200']
  })
  await Leaderboard.create({
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
  await Leaderboard.create({
    reviewId: '661d3655-9c80-4f90-8051-e209e8c21701',
    submissionId: '2b5e54b9-f03c-418b-92f3-5f072b0f3bf1',
    challengeId: '30104645',
    memberId: '123456',
    handle: 'user1',
    aggregateScore: 40,
    testsPassed: 8,
    totalTestCases: 20,
    groupIds: ['100', '200']
  })
  await Leaderboard.create({
    reviewId: '661d3655-9c80-4f90-8051-e209e8c21702',
    submissionId: '2b5e54b9-f03c-418b-92f3-5f072b0f3bf2',
    challengeId: '30104645',
    memberId: '123457',
    handle: 'user2',
    aggregateScore: 50,
    testsPassed: 10,
    totalTestCases: 20,
    groupIds: ['100', '200']
  })
  await Leaderboard.create({
    reviewId: '661d3655-9c80-4f90-8051-e209e8c21703',
    submissionId: '2b5e54b9-f03c-418b-92f3-5f072b0f3bf3',
    challengeId: '30104646',
    memberId: '123456',
    handle: 'user1',
    aggregateScore: 190,
    testsPassed: 4,
    totalTestCases: 6,
    groupIds: ['100']
  })
  await Leaderboard.create({
    reviewId: '661d3655-9c80-4f90-8051-e209e8c21709',
    submissionId: '2b5e54b9-f03c-418b-92f3-5f072b0f3bf9',
    challengeId: '30104646',
    memberId: '123458',
    handle: 'user3',
    aggregateScore: 200,
    testsPassed: 5,
    totalTestCases: 6,
    groupIds: ['100']
  })
  for (const groupId of [202343, 20000000, 100, 200]) {
    await Group.create({
      groupId
    })
  }
}

if (!module.parent) {
  insertData().then(() => {
    logger.info('Done!')
    process.exit()
  }).catch((e) => {
    logger.logFullError(e)
    process.exit(1)
  })
}

module.exports = {
  insertData
}
