// Import the Express framework, which is essential for creating web servers and routers.
const express = require("express");
// Create a new router instance using Express. This router will handle routes specific to questions.
const router = express.Router();

// Import the Mongoose model for 'Question'. This model allows interaction with the 'questions' collection in MongoDB.
const Question = require("../models/question"); // Ensure the path to the model is correct
// Import the controller module containing the logic for handling question-related requests.
const questionController = require("../controller/question_controller"); // Ensure the path to the controller is correct

/**
 * @route   POST /questions/create
 * @desc    Route to handle the creation of a new question.
 *          The request body should contain the necessary data (e.g., the question title).
 *          Delegates the request handling to the 'create' function in the 'questionController'.
 * @access  Public (or protected depending on overall app auth)
 * @controller questionController.create
 */
router.post("/create", questionController.create);

/**
 * @route   GET /questions/:id
 * @desc    Route to retrieve a specific question by its unique ID.
 *          The ':id' is a URL parameter representing the MongoDB ObjectId of the question.
 *          Delegates the request handling to the 'getQuestion' function in the 'questionController'.
 * @access  Public (or protected)
 * @controller questionController.getQuestion
 */
router.get("/:id", questionController.getQuestion);

/**
 * @route   DELETE /questions/:id/delete
 * @desc    Route to delete a specific question by its unique ID.
 *          The ':id' is a URL parameter representing the MongoDB ObjectId of the question to be deleted.
 *          Delegates the request handling to the 'delete' function in the 'questionController'.
 * @access  Public (or protected)
 * @controller questionController.delete
 */
router.delete("/:id/delete", questionController.delete);

/**
 * @description Mounts the option router (from './option.js') as a sub-router under the '/options' path *relative* to this question router.
 *              This means routes defined in './option.js' would be accessible via '/questions/options/...'.
 *              For example, if './option.js' defines a route '/:optionId/add_vote', it would become '/questions/options/:optionId/add_vote'.
 *
 *              **Note:** Based on the structure seen in `routes/index.js` which likely mounts the option router at the top level (`/options`),
 *              mounting it *again* here might be redundant or lead to unexpected behavior depending on the exact routes defined in `./option.js`
 *              and how controllers expect parameters (`:id` meaning question ID vs. option ID).
 *              Common practice is often to have separate top-level routers for distinct resources (`/questions` and `/options`) as set up in `routes/index.js`.
 *              If the intention was to handle options *specific* to a question (e.g., GET /questions/:questionId/options), the mounting path and option router logic would need adjustment.
 * @path /options
 * @router ./option
 */
router.use("/options", require("./option"));

// Export the configured router object. This allows the main application router (e.g., in routes/index.js)
// to mount this question-specific router under a base path (like '/questions').
module.exports = router;
