const config = require("../config/config");

// Koi route na mile to
const notFound = (req, res, next) => {
  const error = new Error(`Route nahi mila: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Har error yahin aakar saaf jawab banta hai
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Server me masla aa gaya";

  // 1. Duplicate key (unique field dobara)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[field] : "";
    message = `${field} "${value}" pehle se maujood hai`;
  }

  // 2. Mongoose validation (schema ke rules toote)
  else if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // 3. Ghalat type ya ID (CastError)
  else if (err.name === "CastError") {
    statusCode = 400;
    message = `${err.path} ki value ghalat hai`;
  }

  // 4. Toota hua JSON body
  else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "JSON ghalat hai, bracket aur commas check karo";
  }

  // 5. Database tak pohanch hi nahi saka
  else if (err.name === "MongoServerSelectionError") {
    statusCode = 503;
    message = "Database se connection nahi ho raha";
  }

  // Production me anjaan 500 errors ka andar ka message nahi dikhate
  if (statusCode === 500 && config.nodeEnv === "production") {
    message = "Server me masla aa gaya";
  }

  const response = { success: false, message };

  // Stack trace sirf development me
  if (config.nodeEnv !== "production") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };