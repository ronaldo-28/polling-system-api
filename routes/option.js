// Import the Express framework, necessary for creating router instances and handling HTTP requests.
const express = require("express");
// Create a new router instance specific to option-related routes.
const router = express.Router();

// Import the Mongoose model for 'Option'. This model will be used by the controller functions
// to interact with the 'options' collection in the MongoDB database.
const Option = require("../models/option"); // Assuming the path is correct relative to this file

// Import the controller module that contains the logic for handling option-related requests.
const optionController = require("../controller/option_controller"); // Assuming the path is correct

/**
 * @route   POST /options/:id/create
 * @desc    Route to create a new option associated with a specific question.
 *          The ':id' parameter in the URL is expected to be the ID of the question
 *          for which the option is being created.
 *          The option details (like text) are expected in the request body.
 * @access  Public (or protected depending on overall app auth)
 * @controller optionController.create
 */
// Note: The route path might seem slightly unconventional. '/:id/create' suggests creating *something*
// related to the resource identified by ':id'. Given the controller name and typical REST patterns,
// ':id' likely refers to the *Question* ID to which this option should be added.
// A more conventional REST path might be POST /questions/:questionId/options
router.post("/:id/create", optionController.create);

/**
 * @route   DELETE /options/:id/delete
 * @desc    Route to delete a specific option by its ID.
 *          The ':id' parameter in the URL is expected to be the ID of the option to be deleted.
 * @access  Public (or protected)
 * @controller optionController.delete
 */
router.delete("/:id/delete", optionController.delete);

/**
 * @route   GET /options/:id/add_vote
 * @desc    Route to increment the vote count for a specific option by its ID.
 *          The ':id' parameter in the URL is expected to be the ID of the option to vote for.
 *          Using GET for actions that modify data (like adding a vote) is generally discouraged in RESTful design;
 *          POST or PUT/PATCH would be more appropriate. However, this documents the current implementation.
 * @access  Public (or protected)
 * @controller optionController.addVote
 */
router.get("/:id/add_vote", optionController.addVote);

// Export the configured router instance so it can be mounted in the main application router (e.g., in routes/index.js)
// under the '/options' path prefix.
module.exports = router;
