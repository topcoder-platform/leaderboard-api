/*
 * Setting up Mock for all tests
 */

const nock = require('nock')
const prepare = require('mocha-prepare')
const { challengeAPIResponse, memberAPIResponse, M2M_FULL_TOKEN } = require('./testData')

prepare(function (done) {
  nock(/\.com/)
    .persist()
    .post('/oauth/token')
    .reply(200, { access_token: M2M_FULL_TOKEN })
    .get('/v5/challenges?legacyId=30000001')
    .reply(200, challengeAPIResponse[0])
    .get('/v5/challenges?legacyId=30051825')
    .reply(200, challengeAPIResponse[1])
    .get('/v5/challenges?legacyId=30051826')
    .reply(200, challengeAPIResponse[2])
    .get('/v5/challenges?legacyId=31000000')
    .reply(200, challengeAPIResponse[3])
    .get('/v5/members?userId=10000&fields=userId,handle')
    .reply(200, memberAPIResponse[0])
    .get('/v5/members?userId=8547899&fields=userId,handle')
    .reply(200, memberAPIResponse[1])
    .get('/v5/members?userId=22688726&fields=userId,handle')
    .reply(200, memberAPIResponse[2])

  done()
}, function (done) {
// called after all test completes (regardless of errors)
  nock.cleanAll()
  done()
})
