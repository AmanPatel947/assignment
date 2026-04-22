const { ApiError } = require('../utils/errors');

function formatIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new ApiError(
          400,
          'Validation failed',
          'VALIDATION_ERROR',
          formatIssues(result.error.issues),
        ),
      );
    }
    req.body = result.data;
    return next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return next(
        new ApiError(
          400,
          'Validation failed',
          'VALIDATION_ERROR',
          formatIssues(result.error.issues),
        ),
      );
    }
    req.params = result.data;
    return next();
  };
}

module.exports = { validateBody, validateParams };
