function AppError(statusCode, message) {
  Error.call(this);
  Error.captureStackTrace(this);
  this.statusCode = statusCode;
  this.message = message;
}

AppError.prototype = Object.create(Error.prototype);
AppError.prototype.constructor = AppError;

module.exports = AppError;
