/**
 * Group service
 */
const _ = require('lodash')
const joi = require('joi')
const logger = require('../common/logger')
const errors = require('../common/errors')
const { Group } = require('../models')

/**
 * Search groups
 * @returns {Array} the groups
 */
async function searchGroups () {
  return _.map(await Group.scan().all().exec(), (group) => group.groupId)
}

/**
 * Create group
 * @param {Number} groupId the group Id
 * @returns {Object} the created group
 */
async function createGroup (groupId) {
  const entity = await Group.get(groupId)
  if (entity) {
    throw new errors.ConflictError(`groupId # ${groupId} already exists.`)
  }
  return Group.create({ groupId })
}

createGroup.schema = {
  groupId: joi.id().required()
}

/**
 * Delete group by id
 * @param {Number} groupId the group Id
 */
async function deleteGroup (groupId) {
  const entity = await Group.get(groupId)
  if (!entity) {
    throw new errors.NotFoundError(`groupId # ${groupId} doesn't exist`)
  }
  await Group.delete(entity)
}

deleteGroup.schema = {
  groupId: joi.id().required()
}

module.exports = {
  searchGroups,
  createGroup,
  deleteGroup
}

logger.buildService(module.exports)
