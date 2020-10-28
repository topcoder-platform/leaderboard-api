/**
 * Group service
 */
const _ = require('lodash')
const joi = require('joi')
const helper = require('../common/helper')
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

  const dbEntity = await Group.create({ groupId })
  try {
    await helper.publishMessage('create', 'group', { groupId })
  } catch (err) {
    logger.logFullError(err)
  }

  return dbEntity
}

createGroup.schema = {
  groupId: joi.string().required()
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
  try {
    await helper.publishMessage('create', 'group', { groupId })
  } catch (err) {
    logger.logFullError(err)
  }
}

deleteGroup.schema = {
  groupId: joi.string().required()
}

module.exports = {
  searchGroups,
  createGroup,
  deleteGroup
}

logger.buildService(module.exports)
