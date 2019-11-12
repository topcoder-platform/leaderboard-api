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
const errors = require('./common/errors')
const authenticator = require('tc-core-library-js').middleware.jwtAuthenticator

const leaderboardService = require('./services/LeaderboardService')

/**
 * Checks if the source matches the term.
 *
 * @param {Array} source the array in which to search for the term
 * @param {Array | String} term the term to search
 */
function checkIfExists (source, term) {
  let terms

  if (!_.isArray(source)) {
    throw new Error('Source argument should be an array')
  }

  source = source.map(s => s.toLowerCase())

  if (_.isString(term)) {
    terms = term.split(' ')
  } else if (_.isArray(term)) {
    terms = term.map(t => t.toLowerCase())
  } else {
    throw new Error('Term argument should be either a string or an array')
  }

  for (let i = 0; i < terms.length; i++) {
    if (source.includes(terms[i])) {
      return true
    }
  }

  return false
}

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

    // Authentication and Authorization
    if (def.auth === 'jwt') {
      actions.push((req, res, next) => {
        authenticator(_.pick(config, ['AUTH_SECRET', 'VALID_ISSUERS']))(req, res, next)
      })

      actions.push((req, res, next) => {
        if (!req.authUser) {
          return next(new errors.UnauthorizedError('Action is not allowed for invalid token'))
        }

        if (req.authUser.scopes) {
          // M2M
          if (def.scopes && !checkIfExists(def.scopes, req.authUser.scopes)) {
            res.forbidden = true
            next(new errors.ForbiddenError('You are not allowed to perform this action!'))
          } else {
            next()
          }
        } else if ((_.isArray(def.access) && def.access.length > 0) ||
          (_.isArray(def.scopes) && def.scopes.length > 0)) {
          next(new errors.UnauthorizedError('You are not authorized to perform this action'))
        } else {
          next()
        }
      })
    }

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
  logger.info(`Reloading incomplete resets...`)
  leaderboardService.resetIncompleteScoreLevels()
  app.listen(app.get('port'), () => {
    logger.info(`Express server listening on port ${app.get('port')}`)
  })
}

module.exports = {
  expressApp: app
}
