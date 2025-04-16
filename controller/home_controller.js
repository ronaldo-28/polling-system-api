// Import the Mongoose library, likely used here for its ObjectId validation or other utility functions,
// although it's not directly used in this specific function's logic beyond interacting with the Mongoose Model.
const mongoose = require("mongoose");

// Import the Mongoose model for 'Question'. This model provides methods
// to interact with the 'questions' collection in the MongoDB database.
const Question = require("../models/question");

/**
 * Controller function to handle requests for the home or listing page,
 * retrieving all questions along with their associated options.
 *
 * @param {object} req - The Express request object, containing information about the incoming request.
 * @param {object} res - The Express response object, used to send a response back to the client.
 * @returns {Promise<object>} - Returns a promise that resolves with the Express response object,
 *                               either sending back the list of questions or an error message.
 */
module.exports.home = async function (req, res) {
  // Use a try...catch block to handle potential errors during database operations or other processing.
  try {
    // Asynchronously find all documents in the 'Question' collection.
    // The empty object `{}` as the query filter means "match all documents".
    // `.populate('options')` is used to automatically replace the ObjectIds stored in the 'options' field
    // of each Question document with the actual corresponding Option documents from the 'options' collection.
    // This assumes the 'options' field in the Question schema is defined as a reference (ref) to the Option model.
    // 'await' pauses the execution until the database query and population are complete.
    let questions = await Question.find({}).populate("options");

    // If the database query is successful, send an HTTP status code 200 (OK)
    // along with the retrieved 'questions' array formatted as a JSON response.
    return res.status(200).json(questions);
  } catch (err) {
    // If any error occurs within the 'try' block (e.g., database connection issue, schema mismatch),
    // log the error details to the server's console for debugging purposes.
    console.log("Error fetching questions:", err);

    // Send an HTTP status code 500 (Internal Server Error) to the client,
    // along with a generic error message in JSON format.
    // Avoid sending detailed error information back to the client for security reasons.
    return res.status(500).json({
      message: "Error retrieving questions from the database.", // Changed message for clarity
      error: "Internal server error", // Kept original error key for consistency if expected by frontend
    });
  }
};
