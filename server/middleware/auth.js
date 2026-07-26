const { verifyToken } = require('../utils/jwt');
const { throwErrorResponse } = require('../utils/response');
const { APIError } = require('../exceptions');

const strictAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw APIError.Unauthorized('Missing authorization header');

    const token = authHeader.replace('Bearer ', '');
    const payload = verifyToken(token);

    req.user = {
      userId: payload.userId,
      publicId: payload.publicId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    return throwErrorResponse(req, res, error);
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        throw APIError.Forbidden('You do not have permission to perform this action');
      }
      next();
    } catch (error) {
      return throwErrorResponse(req, res, error);
    }
  };
};

module.exports = { strictAuth, requireRole };
