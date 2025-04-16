// Import the Mongoose library for interacting with MongoDB.
const mongoose = require("mongoose");
// Import the Option model, which represents the schema for options in the database.
const Option = require("../models/option");
// Import the Question model, which represents the schema for questions in the database.
const Question = require("../models/question");

/**
 * Controller function to create a new option for a specific question.
 * @param {object} req - The Express request object. Expected to have `req.params.id` (question ID)
 *                       and `req.body.text` (option text).
 * @param {object} res - The Express response object used to send back the result.
 * @returns {Promise<object>} - JSON response containing the newly created option or an error message.
 */
module.exports.create = async function (req, res) {
  // Log the request parameters and body for debugging purposes (optional, can be removed in production)
  console.log("Creating option for question ID:", req.params.id);
  console.log("Option data:", req.body);

  // Find the parent question by its ID, provided in the request parameters.
  let question = await Question.findById(req.params.id);

  // Check if the question with the given ID actually exists in the database.
  if (question) {
    // Use a try-catch block to handle potential errors during database operations.
    try {
      // Create a new Option document in the database using the text provided in the request body.
      let option = await Option.create({
        text: req.body.text,
        // 'votes' field will default to 0 based on the schema.
      });

      // Construct the URL that clients can use to vote for this newly created option.
      // Note: The host and port ('http://localhost:8000') are hardcoded.
      // In a production environment, this should be dynamically generated or configured.
      option.link_to_vote = `http://localhost:8000/options/${option._id}/add_vote`;
      // Save the option document again to persist the 'link_to_vote' field.
      await option.save(); // Ensure save operation completes

      // Add the ObjectId of the newly created option to the 'options' array
      // within the parent Question document.
      question.options.push(option._id);
      // Save the updated Question document to persist the changes to its 'options' array.
      await question.save(); // Ensure save operation completes

      // Send a JSON response back to the client containing the newly created option data.
      // The default status code is 200 (OK).
      return res.json(option);
    } catch (err) {
      // If any error occurs during the try block (e.g., database error, validation error),
      // log the error to the console for server-side debugging.
      console.log("Error creating option:", err);
      // Send an HTTP 500 Internal Server Error status code and a generic error message to the client.
      return res.status(500).json({
        message: "Error creating the option.", // More specific message
        error: "Internal server error",
      });
    }
  } else {
    // If the question with the provided ID was not found,
    // send an HTTP 404 Not Found status code and an error message.
    return res.status(404).json({
      message: `Question with ID ${req.params.id} not found.`, // More specific message
      error: "Cannot find question",
    });
  }
};

/**
 * Controller function to delete an option by its ID.
 * An option can only be deleted if it has zero votes.
 * @param {object} req - The Express request object. Expected to have `req.params.id` (option ID).
 * @param {object} res - The Express response object used to send back the result.
 * @returns {Promise<object>} - JSON response indicating success or an error message.
 */
module.exports.delete = async function (req, res) {
  // Use a try-catch block to handle potential errors.
  try {
    // Find the option by its ID, provided in the request parameters.
    let option = await Option.findById(req.params.id);

    // Check if an option with the given ID exists.
    if (option) {
      // Check if the option has any votes associated with it.
      // Options with votes cannot be deleted to maintain data integrity.
      if (option.votes < 1) {
        // Before deleting the option, find the parent question that references it.
        // This query looks for a Question document where the 'options' array contains the ID of the option to be deleted.
        let question = await Question.findOne({
          options: { $elemMatch: { $eq: req.params.id } },
        });

        // Check if a parent question referencing this option was found.
        if (question) {
          // Delete the option document itself from the 'options' collection.
          await Option.findByIdAndDelete(req.params.id);

          // Remove the reference (ObjectId) of the deleted option from the parent question's 'options' array.
          // `$pull` operator removes all instances of a value or values that match a specified condition.
          await Question.updateOne(
            { _id: question._id },
            { $pull: { options: req.params.id } }
          ); // Simplified $pull

          // Send a success response indicating the option was deleted.
          // Optionally include the data of the deleted option.
          return res.json({
            message: "Option deleted successfully",
            data: option,
          });
        } else {
          // This case might indicate inconsistent data (option exists but no question references it).
          // Log it and potentially just delete the option if desired, or return an error.
          console.log(
            `Warning: Option ${req.params.id} found but no parent question references it. Deleting orphan option.`
          );
          await Option.findByIdAndDelete(req.params.id);
          return res.json({
            message: "Orphan option deleted successfully",
            data: option,
          });
          // Or return an error:
          // return res.status(500).json({ message: 'Data inconsistency: Parent question not found for option.' });
        }
      } else {
        // If the option has one or more votes, it cannot be deleted.
        // Send an HTTP 403 Forbidden status code and an error message.
        return res.status(403).json({
          message: `Option with ID ${req.params.id} has votes and cannot be deleted.`, // More specific message
          error: "Option votes are given, cannot delete it",
        });
      }
    } else {
      // If the option with the provided ID was not found,
      // send an HTTP 404 Not Found status code and an error message.
      return res.status(404).json({
        message: `Option with ID ${req.params.id} not found.`, // More specific message
        error: "Cannot find option",
      });
    }
  } catch (err) {
    // If any error occurs during the try block, log it to the console.
    console.log("Error deleting option:", err);
    // Send an HTTP 500 Internal Server Error status code and a generic error message.
    return res.status(500).json({
      message: "Error deleting the option.", // More specific message
      error: "Internal server error",
    });
  }
};

/**
 * Controller function to increment the vote count for a specific option.
 * @param {object} req - The Express request object. Expected to have `req.params.id` (option ID).
 * @param {object} res - The Express response object used to send back the result.
 * @returns {Promise<object>} - JSON response containing the updated option data or an error message.
 */
module.exports.addVote = async function (req, res) {
  // Use a try-catch block for error handling.
  try {
    // Find the option by its ID from the request parameters.
    let option = await Option.findById(req.params.id);

    // Check if the option exists.
    if (option) {
      // Increment the 'votes' counter for the found option document.
      // Using `+= 1` is simple, but for high concurrency, consider using Mongoose's `$inc` operator for atomic updates.
      // Example using $inc: await Option.findByIdAndUpdate(req.params.id, { $inc: { votes: 1 } }, { new: true });
      option.votes += 1;
      // Save the updated option document back to the database.
      await option.save(); // Ensure save operation completes

      // Send a success response including the updated option data.
      return res.json({
        message: "Vote added successfully to option",
        data: option,
      });
    } else {
      // If the option with the provided ID was not found,
      // send an HTTP 404 Not Found status code and an error message.
      return res.status(404).json({
        message: `Option with ID ${req.params.id} not found.`, // More specific message
        error: "Option not found",
      });
    }
  } catch (err) {
    // If any error occurs during the try block, log it.
    console.log("Error adding vote to option:", err);
    // Send an HTTP 500 Internal Server Error status code and a generic error message.
    return res.status(500).json({
      message: "Error adding vote to the option.", // More specific message
      error: "Internal server error",
    });
  }
};
