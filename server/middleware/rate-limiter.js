const { throwErrorResponse } = require('../utils/response');
const { APIError } = require('../exceptions');
const {
  RATE_LIMIT_WINDOW_SECONDS,
  RATE_LIMIT_MAX_REQUESTS,
  AUTH_RATE_LIMIT_WINDOW_SECONDS,
  AUTH_RATE_LIMIT_MAX_REQUESTS,
} = require('../constants/settings');

// In-memory fixed-window limiter — fine for a single-instance deployment.
// Swap for a Redis-backed store (see digital-wallet-apis reference) if this ever runs multi-instance.
const buckets = new Map();

const enforceLimit = (key, maxRequests, windowSeconds) => {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return;
  }

  bucket.count += 1;
  if (bucket.count > maxRequests) {
    throw APIError.TooManyRequests(`Rate limit exceeded. Max ${maxRequests} requests per ${windowSeconds} seconds.`);
  }
};

const rateLimiter = (maxRequests = RATE_LIMIT_MAX_REQUESTS, windowSeconds = RATE_LIMIT_WINDOW_SECONDS) => {
  return (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) return next();

      enforceLimit(`user:${userId}:${req.baseUrl}${req.path}`, maxRequests, windowSeconds);
      next();
    } catch (error) {
      return throwErrorResponse(req, res, error);
    }
  };
};

const ipRateLimiter = (
  maxRequests = AUTH_RATE_LIMIT_MAX_REQUESTS,
  windowSeconds = AUTH_RATE_LIMIT_WINDOW_SECONDS
) => {
  return (req, res, next) => {
    try {
      enforceLimit(`ip:${req.ip}:${req.baseUrl}${req.path}`, maxRequests, windowSeconds);
      next();
    } catch (error) {
      return throwErrorResponse(req, res, error);
    }
  };
};

module.exports = { rateLimiter, ipRateLimiter };
