/**
 * Standard API Response utilities adhering to project specifications
 */

const successResponse = (res, data = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message = 'An error occurred', error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error ? (typeof error === 'object' && error.message ? error.message : error) : message,
  });
};

module.exports = { successResponse, errorResponse };
