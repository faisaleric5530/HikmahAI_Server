const { sendResponse, throwErrorResponse } = require('../utils/response');
const userService = require('../services/user-service');

class UserController {
  static updatePreferences = async (req, res) => {
    try {
      const response = await userService.updatePreferences({
        userPublicId: req.user.publicId,
        hashIdentity: req.body.hashIdentity,
      });
      return sendResponse(res, 'success', { message: 'Preferences updated', data: response });
    } catch (err) {
      return throwErrorResponse(req, res, err);
    }
  };
}

module.exports = UserController;
