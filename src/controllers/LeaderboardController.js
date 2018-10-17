/**
 * Leaderboard Controller
 */

const LeaderboardService = require('../services/LeaderboardService')

/**
 * Get leaderboard details
 * @param req the request
 * @param res the response
 */
async function getLeaderboard (req, res) {
  res.json(await LeaderboardService.getLeaderboard(req.query))
}

module.exports = {
  getLeaderboard
}
