/**
 * middleware/validate.js
 *
 * Request Body Validation Middleware Factory.
 *
 * Usage:
 *   const validate = require("../middleware/validate");
 *   router.post("/endpoint", validate(["field1", "field2"]), controller);
 *
 * How it works:
 *  - Accepts an array of field names that are REQUIRED in the request body.
 *  - Returns an Express middleware function that checks each required field.
 *  - If any field is missing or blank, responds with 400 Bad Request and
 *    lists all missing fields in the error response.
 *  - If all fields are present, calls next() to continue to the controller.
 *
 * This provides a single, reusable layer for input validation so controllers
 * stay clean and focused on business logic only.
 */

/**
 * @param {string[]} requiredFields - Array of required body field names
 * @returns {Function} Express middleware function
 */
const validate = (requiredFields = []) => {
  return (req, res, next) => {
    const missing = [];

    // Check each required field; track any that are absent or empty strings
    requiredFields.forEach((field) => {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        req.body[field] === ""
      ) {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    next();
  };
};

module.exports = validate;
