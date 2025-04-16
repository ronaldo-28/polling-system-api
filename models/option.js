// Importing the Mongoose library, which provides tools for modeling MongoDB data
// and interacting with the database in an object-oriented way.
const mongoose = require("mongoose");

/**
 * Defines the schema for the 'Option' model.
 * A schema maps to a MongoDB collection and defines the shape of the documents within that collection.
 * This schema outlines the structure for options associated with a question in the polling system.
 */
const optionSchema = new mongoose.Schema({
  // The text content of the option (e.g., "Yes", "No", "Maybe").
  text: {
    type: String, // Specifies the data type as String.
    required: true, // Makes this field mandatory; an option must have text.
  },
  // The number of votes this particular option has received.
  votes: {
    type: Number, // Specifies the data type as Number.
    default: 0, // Sets a default value of 0 if no value is provided when creating an option.
    // Ensures that new options start with zero votes.
  },
  // A string field intended to store a URL that can be used to directly add a vote to this option.
  // This is typically generated dynamically when the option is created or retrieved.
  link_to_vote: {
    type: String, // Specifies the data type as String.
    // Note: This field is not set to 'required' as it might be populated after the initial creation.
  },
  // Mongoose automatically adds an _id field of type ObjectId.
  // Timestamps (createdAt, updatedAt) could also be added using { timestamps: true } in the schema options if needed.
});

/**
 * Creates the Mongoose model for the 'Option' schema.
 * A Mongoose model is a constructor compiled from a schema definition.
 * An instance of a model represents a MongoDB document and can be saved, updated, deleted, etc.
 * The first argument is the singular name of the collection the model is for (Mongoose automatically looks for the plural, lowercase version - 'options' in this case).
 * The second argument is the schema to use.
 */
const Option = mongoose.model("Option", optionSchema);

// Exporting the Option model so it can be imported and used in other parts of the application,
// such as controllers that handle creating, reading, updating, or deleting options.
module.exports = Option;
