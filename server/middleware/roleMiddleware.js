const { errorResponse } = require('../utils/apiResponse');

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Permitted user roles e.g. 'ADMIN', 'ACCOUNTS TEAM', 'VENDOR'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 'Unauthorized', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role "${req.user.role}" does not have permission to access this resource.`,
        'Forbidden',
        403
      );
    }

    next();
  };
};

module.exports = { authorize };
