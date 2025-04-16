// Require the express module, which is a minimal and flexible Node.js web application framework.
const express = require("express");
// Create a new instance of the express application. This 'app' object will be used to configure the server.
const app = express();
// Define the port number on which the server will listen for incoming connections.
const PORT = 3000;
// Require the Mongoose configuration file. This likely sets up the connection to a MongoDB database.
// The 'db' variable might hold the connection object or related Mongoose instance, though it's not explicitly used further in this snippet.
const db = require("./config/mongoose");
// Require the body-parser middleware. This middleware is used to parse incoming request bodies.
const bodyParser = require("body-parser");

/**
 * Middleware to parse URL-encoded request bodies.
 * It parses incoming requests with URL-encoded payloads and makes the resulting object
 * (containing key-value pairs) available under the `req.body` property.
 * `extended: false` means that the querystring library will be used for parsing,
 * which handles simpler data structures.
 */
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * Mount the application's router.
 * This line tells the Express app to use the router defined in the './routes' module
 * for any requests that start with the path '/'.
 * All API endpoints and web routes will be defined within that routes module.
 */
app.use("/", require("./routes"));

/**
 * Start the HTTP server and make it listen for connections on the specified PORT.
 * A callback function is provided to handle the start event.
 * @param {number} PORT - The port number the server should listen on.
 * @param {function} callback - A function to execute once the server starts listening.
 *                              It receives an error object (err) if starting the server failed.
 */
app.listen(PORT, (err) => {
  // Check if an error occurred while trying to start the server.
  if (err) {
    // If an error occurred, log the error details to the console.
    console.log("Error starting server:", err);
    // Exit the callback function.
    return;
  }
  // If the server started successfully without errors, log a confirmation message to the console,
  // indicating the port number it's running on.
  console.log("Server is running successfully at port: ", PORT);
});
