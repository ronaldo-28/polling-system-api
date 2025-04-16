// controller/question_controller.js

// Import Mongoose for database interactions and ObjectId validation.
const mongoose = require("mongoose");
// Import the Question model to interact with the 'questions' collection.
const Question = require("../models/question"); // Ensure this path points to your Question model file
// Import the Option model to interact with the 'options' collection, especially for deletion.
const Option = require("../models/option"); // Ensure this path points to your Option model file

/**
 * Controller function to create a new question.
 * Expects the question title in the request body.
 * @param {object} req - The Express request object. Expected `req.body.title` to contain the question text.
 * @param {object} res - The Express response object used to send back the result.
 * @returns {Promise<object>} - JSON response containing the newly created question or an error message.
 */
module.exports.create = async function (req, res) {
  // Basic validation: Check if the 'title' field exists in the request body and is not just whitespace.
  if (!req.body.title || req.body.title.trim() === "") {
    // If validation fails, send a 400 Bad Request status with an informative message.
    return res.status(400).json({
      message: "Question title cannot be empty",
    });
  }

  // Use a try-catch block to handle potential errors during database interaction.
  try {
    // Create a new document in the 'questions' collection using the Question model.
    // The 'title' is taken from the request body and trimmed of leading/trailing whitespace.
    let question = await Question.create({
      title: req.body.title.trim(), // Trim whitespace before saving
    });

    // If creation is successful, send a 201 Created status code.
    // Include a success message and the data of the newly created question in the JSON response.
    return res.status(201).json({
      // Use 201 Created status code for successful resource creation.
      message: "Question Created Successfully",
      data: question, // Send back the created question object
    });
  } catch (err) {
    // Log the error to the console for server-side debugging.
    console.error("Error creating question:", err);
    // If an error occurs (e.g., database connection issue), send a 500 Internal Server Error status.
    // Include a more specific error message in the JSON response.
    return res.status(500).json({
      message: "Internal server error while creating question", // More specific message
    });
  }
};

/**
 * Controller function to delete a question and its associated options.
 * A question can only be deleted if none of its options have any votes.
 * @param {object} req - The Express request object. Expected `req.params.id` to contain the ID of the question to delete.
 * @param {object} res - The Express response object used to send back the result.
 * @returns {Promise<object>} - JSON response indicating success or failure with appropriate messages.
 */
module.exports.delete = async function (req, res) {
  // Use a try-catch block for robust error handling during find and delete operations.
  try {
    // Find the question by the ID provided in the URL parameters (`req.params.id`).
    // Use `.populate('options')` to load the actual option documents referenced in the question's 'options' array.
    // Use `.exec()` to ensure a full Mongoose Promise is returned, which is good practice with populate.
    const question = await Question.findById(req.params.id)
      .populate("options") // Load associated option documents
      .exec(); // Execute the query and return a promise

    // If `findById` returns null or undefined, the question with the given ID was not found.
    if (!question) {
      // Send a 404 Not Found status and a message indicating the question doesn't exist.
      return res.status(404).json({ message: "Question not found" }); // Changed 'error' key to 'message' for consistency
    }

    // Check if any of the associated options have received votes.
    // The `.some()` array method efficiently checks if at least one element satisfies the condition.
    // It stops iterating as soon as it finds an option with `votes > 0`.
    const hasVotes = question.options.some((option) => option.votes > 0);

    // If any option has votes, the question cannot be deleted.
    if (hasVotes) {
      // Send a 403 Forbidden status, as the action is disallowed due to existing votes.
      return res
        .status(403) // 403 Forbidden is appropriate here
        .json({
          message:
            "Cannot delete this question as one or more of its options have votes",
        }); // Changed 'error' key to 'message'
    }

    // If the question exists and none of its options have votes, proceed with deletion.
    // First, delete all the options associated with this question.
    // Check if there are options to delete to avoid an unnecessary database call.
    if (question.options.length > 0) {
      // Use `Option.deleteMany` to remove multiple documents based on a query.
      // The query `$in` matches any document whose `_id` is in the provided array of option IDs.
      await Option.deleteMany({
        _id: { $in: question.options.map((opt) => opt._id) }, // Create an array of Option ObjectIds
      });
    }

    // After deleting the options, delete the question document itself.
    // `findByIdAndDelete` finds the document by ID and removes it atomically.
    await Question.findByIdAndDelete(req.params.id);
    // Alternatively, if you need the deleted document data:
    // const deletedQuestion = await Question.findByIdAndDelete(req.params.id);

    // Send a 200 OK status indicating successful deletion.
    return res.status(200).json({
      message: "Question and associated options deleted successfully",
      // Optionally, you could return the data of the deleted question:
      // data: deletedQuestion // If you captured the result from findByIdAndDelete
    });
  } catch (err) {
    // Log the error for server-side debugging.
    console.error("Error deleting question:", err);

    // Specific check for invalid MongoDB ObjectId format errors.
    // Mongoose sometimes throws errors with a `kind` property for validation issues.
    if (err.kind === "ObjectId") {
      // If the ID format is wrong, send a 400 Bad Request.
      return res.status(400).json({ message: "Invalid Question ID format" });
    }

    // For any other type of error (e.g., database connection issues), send a 500 Internal Server Error.
    return res
      .status(500)
      .json({ message: "Internal server error while deleting question" }); // Changed 'error' key to 'message'
  }
};

/**
 * Controller function to retrieve a specific question by its ID,
 * along with its populated options, each including a dynamically generated voting link.
 * @param {object} req - The Express request object. Expected `req.params.id` to contain the ID of the question to retrieve.
 * @param {object} res - The Express response object used to send back the result.
 * @returns {Promise<object>} - JSON response containing the question details or an error message.
 */
module.exports.getQuestion = async function (req, res) {
  // Added 'async' keyword as this function uses 'await'.
  // Use a try-catch block to handle potential errors during database query or processing.
  try {
    // Find the question by ID using `findById`.
    // Populate the 'options' field to get the full option documents.
    // Use `exec()` to get a full promise.
    let question = await Question.findById(req.params.id)
      .populate("options") // Fetch associated Option documents
      .exec(); // Execute the query

    // Check if the `question` variable holds a document (i.e., if the question was found).
    if (question) {
      // If the question is found, enhance the options data by adding a `link_to_vote`.
      // Map over the populated `question.options` array.
      const optionsWithLinks = question.options.map((option) => ({
        ...option.toObject(), // Convert the Mongoose document to a plain JavaScript object to allow adding new properties.
        // Construct the voting URL dynamically based on the current request's protocol and host, and the option's ID.
        link_to_vote: `${req.protocol}://${req.get("host")}/options/${
          option._id
        }/add_vote`,
      }));

      // Send a 200 OK status with a success message.
      // Structure the response data clearly, including the question details and the enhanced options array.
      return res.status(200).json({
        message: "Question details retrieved successfully",
        data: {
          // Structure the response data for clarity
          _id: question._id,
          title: question.title,
          options: optionsWithLinks, // Send the array of options, each now including the 'link_to_vote'
        },
      });
    } else {
      // If `findById` returns `null`, the question with the given ID doesn't exist.
      // Send a 404 Not Found status with an appropriate message.
      return res.status(404).json({ message: "Question not found" });
    }
  } catch (err) {
    // --- IMPORTANT: Log the actual error for debugging! ---
    console.error("Error fetching question:", err);

    // Check if the error is due to an invalid MongoDB ObjectId format.
    if (err.kind === "ObjectId") {
      // Send a 400 Bad Request if the ID format is invalid.
      return res.status(400).json({ message: "Invalid Question ID format" });
    }

    // For any other unexpected errors during the process, send a 500 Internal Server Error.
    return res
      .status(500)
      .json({ message: "Internal server error while fetching question" });
  }
};

// It's good practice to keep controllers focused.
// Functions related purely to options (like creating or voting on them)
// might be better placed in a separate `options_controller.js` file
// to maintain separation of concerns.
// Example placeholder if options actions were included here:
// module.exports.addOption = async function(req, res) { /* ... option creation logic ... */ }
