/**
 * catchAsync is a higher-order function that wraps async controller functions
 * and automatically passes any errors to Express's error handling middleware.
 *
 * @param {Function} fn - An async controller function (req, res, next)
 * @returns {Function} - A new function that executes the async function and catches errors
 *
 * Example usage:
 * const login = catchAsync(async (req, res, next) => { ... });
 */
module.exports = fn => {
  return (req, res, next) => {
    // Execute the async function and catch any rejected promises
    Promise.resolve(fn(req, res, next))
      .catch(next); // Pass the error to Express's next() function
  };
};
