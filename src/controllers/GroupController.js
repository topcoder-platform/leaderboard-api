/**
 * Group Controller
 */

const GroupService = require('../services/GroupService')

/**
 * Search groups
 * @param req the request
 * @param res the response
 */
async function searchGroups (req, res) {
  res.json(await GroupService.searchGroups())
}

/**
 * Create group
 * @param req the request
 * @param res the response
 */
async function createGroup (req, res) {
  const result = await GroupService.createGroup(req.params.groupId)
  res.json(result)
}

/**
 * Delete group by id
 * @param req the request
 * @param res the response
 */
async function deleteGroup (req, res) {
  await GroupService.deleteGroup(req.params.groupId)
  res.status(204).end()
}

module.exports = {
  searchGroups,
  createGroup,
  deleteGroup
}
