const { errorResponse } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  return errorResponse(res, `Resource not found at ${req.originalUrl}`, 'Not Found', 404);
};

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err.stack || err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value entered for field: ${field}`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ID format for parameter: ${err.path}`;
  }

  return errorResponse(res, message, err, statusCode);
};

module.exports = { notFound, errorHandler };
