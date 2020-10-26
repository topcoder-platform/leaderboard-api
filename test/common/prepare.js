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
    .get('/v4/challenges?filter=id=30000001')
    .reply(200, challengeAPIResponse[0])
    .get('/v4/challenges?filter=id=30051825')
    .reply(200, challengeAPIResponse[1])
    .get('/v4/challenges?filter=id=30051826')
    .reply(200, challengeAPIResponse[2])
    .get('/v4/challenges?filter=id=31000000')
    .reply(200, challengeAPIResponse[3])
    .get('/v3/users?filter=id=10000')
    .reply(200, memberAPIResponse[0])
    .get('/v3/users?filter=id=8547899')
    .reply(200, memberAPIResponse[1])
    .get('/v3/users?filter=id=22688726')
    .reply(200, memberAPIResponse[2])

  done()
}, function (done) {
// called after all test completes (regardless of errors)
  nock.cleanAll()
  done()
})
