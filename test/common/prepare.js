/*
 * Setting up Mock for all tests
 */

const nock = require('nock')
const prepare = require('mocha-prepare')
const { challengeAPIResponse, memberAPIResponse } = require('./testData')

prepare(function (done) {
  nock(/\.com/)
    .persist()
    .post('/oauth/token')
    .reply(200, { access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJUb3Bjb2RlciBVc2VyIiwiQ29ubmVjdCBTdXBwb3J0IiwiYWRtaW5pc3RyYXRvciIsInRlc3RSb2xlIiwiYWFhIiwidG9ueV90ZXN0XzEiLCJDb25uZWN0IE1hbmFnZXIiLCJDb25uZWN0IEFkbWluIiwiY29waWxvdCIsIkNvbm5lY3QgQ29waWxvdCBNYW5hZ2VyIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLWRldi5jb20iLCJoYW5kbGUiOiJUb255SiIsImV4cCI6MTU2NTY4MTkyMCwidXNlcklkIjoiODU0Nzg5OSIsImlhdCI6MTU1NTY4MTMyMCwiZW1haWwiOiJhamVmdHNAdG9wY29kZXIuY29tIiwianRpIjoiMTlhMDkzNzAtMjk4OC00N2I4LTkxODktMGRhODVjNjM0ZWQyIn0.V8nsQpbzQ_4iEd0dAbuYsfeydnhSAEQ95AKKwl8RONw' })
    .get('/v3/challenges?filter=id=30000001')
    .reply(200, challengeAPIResponse[0])
    .get('/v3/challenges?filter=id=30051825')
    .reply(200, challengeAPIResponse[1])
    .get('/v3/challenges?filter=id=30051826')
    .reply(200, challengeAPIResponse[2])
    .get('/v3/challenges?filter=id=31000000')
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
