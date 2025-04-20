// config/mongoose.js

// Import the Mongoose library
const mongoose = require("mongoose");

// Load environment variables from .env file *only* in development/testing
// In production, environment variables are typically set directly on the server.
// You might choose to load dotenv configuration in your main app file (index.js) instead,
// which is often preferred to ensure variables are loaded before anything else.
// See alternative approach below if you load dotenv in index.js
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // Load .env file variables
}

// Retrieve the MongoDB connection string from environment variables
const dbURI = process.env.MONGODB_URI;

// Check if the environment variable is set
if (!dbURI) {
  console.error("Error: MONGODB_URI environment variable is not set.");
  console.error(
    "Please ensure you have a .env file with MONGODB_URI defined or that the variable is set in your deployment environment."
  );
  process.exit(1); // Exit if the database URI is missing, as the app cannot run
}

// Establish a connection to the MongoDB database using the URI from the environment variable.
mongoose.connect(dbURI, {
  useNewUrlParser: true, // Use the new URL string parser
  useUnifiedTopology: true, // Use the unified topology engine
  // Consider adding these for future compatibility and suppressing warnings:
  // useCreateIndex: true,    // Deprecated, but might be needed for older Mongoose/MongoDB versions
  // useFindAndModify: false, // Use native findOneAndUpdate() instead
});

// Get the default Mongoose connection object.
const db = mongoose.connection;

// Set up an event listener for the 'error' event on the database connection.
db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
  // Consider adding more robust error handling or application shutdown logic here
});

// Set up a one-time event listener for the 'open' event on the database connection.
db.once("open", () => {
  console.log(`Successfully connected to the MongoDB database.`);
  // Optionally log which database you connected to (extracted from URI if needed, but often implicit)
});

// Export the database connection object (`db`).
module.exports = db;
