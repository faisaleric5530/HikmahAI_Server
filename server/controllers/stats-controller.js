const { sendResponse, throwErrorResponse } = require('../utils/response');
const statsService = require('../services/stats-service');

class StatsController {
  static getStats = async (req, res) => {
    try {
      const response = await statsService.getPlatformStats();
      return sendResponse(res, 'success', { message: 'Platform stats fetched successfully', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };
}

module.exports = StatsController;
