/**
 * Leaderboard Controller
 */

const LeaderboardService = require('../services/LeaderboardService')

/**
 * Create leaderboard detail
 * @param req the request
 * @param res the response
 */
async function createLeaderboard (req, res) {
  const result = await LeaderboardService.createLeaderboard(req.params.challengeId, req.params.memberId, req.body)
  if (result) {
    res.json(result)
  } else {
    res.status(204).end()
  }
}

/**
 * Update leaderboard detail
 * @param req the request
 * @param res the response
 */
async function updateLeaderboard (req, res) {
  res.json(await LeaderboardService.updateLeaderboard(req.params.challengeId, req.params.memberId, req.body))
}

/**
 * Delete leaderboard detail by review id
 * @param req the request
 * @param res the response
 */
async function deleteLeaderboard (req, res) {
  await LeaderboardService.deleteLeaderboard(req.params.reviewId)
  res.status(204).end()
}

/**
 * Search leaderboard details
 * @param req the request
 * @param res the response
 */
async function searchLeaderboards (req, res) {
  res.json(await LeaderboardService.searchLeaderboards(req.query))
}

module.exports = {
  createLeaderboard,
  updateLeaderboard,
  deleteLeaderboard,
  searchLeaderboards
}
