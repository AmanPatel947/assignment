const { ApiError } = require('../utils/errors');
const { verifyToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Missing bearer token', 'AUTH_REQUIRED'));
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token', 'AUTH_INVALID'));
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new ApiError(403, 'Forbidden', 'FORBIDDEN'));
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
