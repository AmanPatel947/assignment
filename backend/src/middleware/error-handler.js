const { ApiError } = require('../utils/errors');

function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
}

function errorHandler(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const status = isApiError ? err.status : 500;
  const payload = {
    error: {
      message: isApiError ? err.message : 'Unexpected error',
      code: isApiError ? err.code : 'INTERNAL_ERROR',
    },
  };

  if (isApiError && err.details) {
    payload.error.details = err.details;
  }

  if (!isApiError) {
    console.error(err);
  }

  res.status(status).json(payload);
}

module.exports = { notFoundHandler, errorHandler };
