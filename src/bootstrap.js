/**
 * Init app
 */

global.Promise = require('bluebird')

const joi = require('joi')

joi.id = () => joi.number().integer().min(1)
joi.page = () => joi.number().integer().min(1).default(1)
joi.perPage = () => joi.number().integer().min(1).max(100).default(20)
