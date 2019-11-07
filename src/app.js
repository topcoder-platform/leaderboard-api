/**
 * The application entry point
 */

require('./bootstrap')
const config = require('config')
const express = require('express')
const bodyParser = require('body-parser')
const _ = require('lodash')
const cors = require('cors')
const httpStatus = require('http-status-codes')
const helper = require('./common/helper')
const logger = require('./common/logger')
const routes = require('./routes')

// setup express app
const app = express()

app.set('port', config.PORT)

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const apiRouter = express.Router()

// load all routes
_.each(routes, (verbs, url) => {
  _.each(verbs, (def, verb) => {
    const actions = []
    const method = require('./controllers/' + def.controller)[def.method]
    if (!method) {
      throw new Error(def.method + ' is undefined')
    }
    actions.push((req, res, next) => {
      req.signature = `${def.controller}#${def.method}`
      next()
    })
    actions.push(method)
    apiRouter[verb](url, helper.autoWrapExpress(actions))
  })
})

app.use('/v5/', apiRouter)

app.use((err, req, res, next) => {
  logger.logFullError(err, req.signature)
  const errorResponse = {}
  const status = err.isJoi ? httpStatus.BAD_REQUEST : (err.status || err.httpStatus || httpStatus.INTERNAL_SERVER_ERROR)

  if (_.isArray(err.details)) {
    if (err.isJoi) {
      _.map(err.details, (e) => {
        if (e.message) {
          if (_.isUndefined(errorResponse.message)) {
            errorResponse.message = e.message
          } else {
            errorResponse.message += `, ${e.message}`
          }
        }
      })
    }
  }

  if (err.response) {
    // extract error message from V3 API
    errorResponse.message = _.get(err, 'response.body.result.content')
  }

  if (_.isUndefined(errorResponse.message)) {
    if (err.message && status !== httpStatus.INTERNAL_SERVER_ERROR) {
      errorResponse.message = err.message
    } else {
      errorResponse.message = 'Internal server error'
    }
  }

  res.status(status).json(errorResponse)
})

// Check if the route is not found or HTTP method is not supported
app.use('*', (req, res) => {
  const route = routes[req.baseUrl.substring(3)]
  if (route) {
    res.status(httpStatus.METHOD_NOT_ALLOWED).json({ message: 'The requested HTTP method is not supported.' })
  } else {
    res.status(httpStatus.NOT_FOUND).json({ message: 'The requested resource cannot be found.' })
  }
})

if (!module.parent) {
  app.listen(app.get('port'), () => {
    logger.info(`Express server listening on port ${app.get('port')}`)
  })
}

module.exports = {
  expressApp: app
}
