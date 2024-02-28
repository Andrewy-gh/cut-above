class ApiError extends Error {
  constructor(statusCode, message) {
    super(message); // Call the superclass (Error) constructor
    this.statusCode = statusCode;
  }
}

export default ApiError;
