const config = require('config')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { challengeAPIResponse, memberAPIResponse, submissionAPIResponse } = require('./testData')

// setup express app
const app = express()

app.set('port', config.MOCK_API_PORT)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/challenges', function (req, res) {
  const challengeId = req.query.filter.substring(3)
  if (challengeId === '30000001') {
    res.send(challengeAPIResponse[0])
  } else if (challengeId === '30051825') {
    res.send(challengeAPIResponse[1])
  } else if (challengeId === '30051826') {
    res.send(challengeAPIResponse[2])
  } else {
    res.send(challengeAPIResponse[3])
  }
})

app.get('/users', function (req, res) {
  const memberId = req.query.filter.substring(3)
  if (memberId === '8547899') {
    res.send(memberAPIResponse[1])
  } else if (memberId === '22688726') {
    res.send(memberAPIResponse[2])
  } else {
    res.send(memberAPIResponse[0])
  }
})

app.get('/submissions/:id', function (req, res) {
  if (req.params.id === 'a34e1158-2c27-4d38-b079-5e5cca1bdcf7') {
    res.send(submissionAPIResponse[0])
  } else if (req.params.id === 'a34e1158-2c27-4d38-b079-5e5cca1bdcf8') {
    res.send(submissionAPIResponse[1])
  } else {
    res.status(404).end()
  }
})

app.listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')}`)
})
