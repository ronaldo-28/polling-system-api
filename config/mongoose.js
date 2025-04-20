// Import the Mongoose library, which provides a straightforward, schema-based solution
// to model application data for MongoDB. It includes built-in type casting, validation,
// query building, business logic hooks, and more, out of the box.
const mongoose = require("mongoose");

// Establish a connection to the MongoDB database.
// `mongoose.connect()` is used to connect to a running MongoDB instance.
// The first argument is the MongoDB connection string (URI).
// "mongodb://127.0.0.1:27017/PollingSys" specifies:
//   - protocol: `mongodb`
//   - host: `127.0.0.1` (localhost)
//   - port: `27017` (default MongoDB port)
//   - database name: `PollingSys`
// The second argument is an options object:
//   - `useNewUrlParser: true`: Tells the MongoDB driver to use its new URL parser. (Recommended, though may become default/deprecated later).
//   - `useUnifiedTopology: true`: Tells the MongoDB driver to use the new Server Discovery and Monitoring engine. (Recommended, though may become default/deprecated later).
mongoose.connect(
  "mongodb+srv://ronaldo:ronaldo28@cluster0.xxbuq7q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true, // Use the new URL string parser
    useUnifiedTopology: true, // Use the unified topology engine
  }
);

// Get the default Mongoose connection object.
// This object represents the connection to the MongoDB database established above.
// It emits events like 'error' and 'open' that can be listened to.
const db = mongoose.connection;

// Set up an event listener for the 'error' event on the database connection.
// If the connection encounters an error after the initial connection was established,
// this listener will trigger the provided callback function.
// The callback logs the error message to the console for debugging purposes.
db.on("error", (error) => {
  console.error("MongoDB connection error:", error);
});

// Set up a one-time event listener for the 'open' event on the database connection.
// This event is emitted when Mongoose successfully connects to the MongoDB server.
// The `once` method ensures the callback function is executed only the first time the event occurs.
// The callback logs a confirmation message to the console indicating a successful connection.
db.once("open", () => {
  console.log("Successfully connected to the MongoDB database: PollingSys");
});

// Export the database connection object (`db`).
// This allows other modules within the application (like models or the main server file)
// to import and use this connection object, for instance, to interact with the database
// or simply to ensure the connection is established before proceeding.
module.exports = db;
