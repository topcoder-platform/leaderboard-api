/**
 * Init app
 */

global.Promise = require('bluebird')

const joi = require('joi')

joi.id = () => joi.number().integer().min(1)
