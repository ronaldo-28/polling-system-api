// Import the Express framework, which is necessary to create router instances.
const express = require("express");

// Create a new router object using Express's Router() middleware.
// This router will handle incoming requests and direct them to the appropriate controllers or other routers.
const router = express.Router();

// Import the Mongoose library. While not directly used for routing logic in *this* file,
// it might be imported here if there were plans for middleware that directly uses Mongoose,
// or simply kept for consistency if other route files import it. In this specific snippet, it's not actively used.
const mongoose = require("mongoose");

// Import the Option model. Similar to Mongoose, it's imported but not directly used in this top-level router file.
// Child routers ('./question', './option') will likely use this and the Question model.
const Option = require("../models/option"); // Assuming the path is correct relative to this file

// Import the controller module responsible for handling requests to the home/root path ('/').
const homeController = require("../controller/home_controller"); // Assuming the path is correct

// Import the controller module specifically for handling option-related routes.
// While the '/options' routes are delegated below, this import might be present for potential future use
// or was part of previous code structure. It's not strictly necessary if all option logic is within './option'.
const optionController = require("../controller/option_controller"); // Assuming the path is correct

/**
 * @route GET /
 * @description Route to handle requests to the root URL of the application.
 *              Delegates the request handling to the 'home' function within the 'homeController'.
 *              This typically displays a list of all questions or a welcome page.
 * @controller homeController.home
 */
router.get("/", homeController.home);

/**
 * @description Middleware to delegate all routes starting with '/questions' to a dedicated question router.
 *              Any request path like '/questions/create', '/questions/:id', etc., will be handled by the
 *              router defined in the './question.js' file.
 * @path /questions
 * @router ./question
 */
router.use("/questions", require("./question"));

/**
 * @description Middleware to delegate all routes starting with '/options' to a dedicated option router.
 *              Any request path like '/options/:id/add_vote', '/options/:id/delete', etc., will be handled by the
 *              router defined in the './option.js' file.
 * @path /options
 * @router ./option
 */
router.use("/options", require("./option"));

// Export the configured router object so it can be mounted by the main application file (e.g., index.js or app.js).
// This makes all the defined routes and delegated routes available to the application.
module.exports = router;
