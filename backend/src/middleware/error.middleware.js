import { APIError } from "../utils/apiError.js"; // Corrected capitalization

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred.";
  let errors = err.errors || [];

  // specific Mongoose errors
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}.`;
    errors = [{ path: err.path, message: `Invalid ${err.path}` }];
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Failed";
    errors = Object.values(err.errors).map((error) => ({
      path: error.path,
      message: error.message,
    }));
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value: ${field}. Please use another value.`;
    errors = [{ path: field, message: `Duplicate ${field}` }];
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
    errors = [{ path: "token", message: "Invalid token" }];
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token has expired. Please log in again.";
    errors = [{ path: "token", message: "Token expired" }];
  }

  if (err instanceof APIError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  if (statusCode === 500) {
    console.error(`SERVER ERROR: ${err.message}`, err.stack);
  } else {
    console.warn(`CLIENT ERROR (${statusCode}): ${err.message}`);
  }

  return res.status(statusCode).json({
    success: false,
    message: message,
    errors: errors,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export { errorMiddleware };
