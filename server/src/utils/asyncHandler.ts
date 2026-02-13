// Async utility to handle asynchronous Express route handlers using Promises and async/await

// 1st approach: Using Promises
const asyncHandlerPromise = (requestHandler) => {
  // This middleware function wraps the provided requestHandler in a Promise
  // and catches any errors that may occur during its execution.
  return (req, res, next) => {
    // Resolve the Promise with the result of the requestHandler
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err)); // Catch any errors and pass them to the next middleware
  };
};

// 2nd approach: Using async/await
const asyncHandlerAsyncAwait = (fn) => async (req, res, next) => {
  try {
    // Execute the provided asynchronous function (fn) with the Express request, response, and next parameters
    await fn(req, res, next);
  } catch (error) {
    // If an error occurs during execution, handle it by sending an error response
    res.status(error.code || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export { asyncHandlerPromise, asyncHandlerAsyncAwait };
