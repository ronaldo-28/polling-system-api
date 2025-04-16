# Polling System API

A simple Node.js API backend built with Express and MongoDB for creating questions and voting on their associated options.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Technology Stack](#technology-stack)
- [Configuration](#configuration)

## Prerequisites

Before you begin, ensure you have the following installed on your local system:

1.  **Node.js**: (Includes npm - Node Package Manager) Download and install a recent LTS version from [nodejs.org](https://nodejs.org/).
2.  **MongoDB**: The application uses MongoDB as its database. Install MongoDB Community Server from the [official MongoDB website](https://www.mongodb.com/try/download/community) and ensure the MongoDB server (`mongod`) is running.

## Installation

Follow these steps to get the project set up on your machine:

1.  **Clone the Repository:**
    Open your terminal or command prompt and clone the project repository (replace `<repository-url>` with the actual URL if available, otherwise download/copy the files into a directory):

    ```bash
    git clone <repository-url> polling-system-api
    cd polling-system-api
    ```

    If you don't have a Git URL, simply navigate into the project directory you created.

2.  **Install Dependencies:**
    Install the required Node.js packages listed in `package.json` (assuming one exists, based on the dependencies used like Express, Mongoose, body-parser).

    ```bash
    npm install
    ```

    This command downloads and installs all necessary libraries into the `node_modules` directory.

3.  **Database Setup:**
    Ensure your local MongoDB server is running. By default, MongoDB runs on `127.0.0.1:27017`. The application is configured (in `config/mongoose.js`) to connect to a database named `PollingSys` on this default instance. MongoDB will automatically create the database when the application first connects and attempts to write data if it doesn't already exist.

## Running the Application

Once the installation is complete, you can start the API server:

1.  **Start the Server:**
    Run the main application file (assuming it's `index.js` based on the first code snippet).

    ```bash
    node index.js
    ```

    _Alternatively, if a start script is defined in `package.json` (e.g., `"start": "node index.js"`), you can use:_

    ```bash
    npm start
    ```

2.  **Verify:**
    If the server starts successfully, you should see a message in your console like:
    ```
    MongoDB connected
    Server is running successfully at port: 3000
    ```
    The API will now be listening for requests on `http://localhost:3000`.

## API Endpoints

The following endpoints are available:

### Questions

- **`GET /`**

  - Description: Retrieves a list of all questions, with their associated options populated.
  - Controller: `home_controller.home`
  - Success Response: `200 OK` with JSON array of questions.
  - Example: `curl http://localhost:3000/`

- **`POST /questions/create`**

  - Description: Creates a new question.
  - Controller: `question_controller.create`
  - Request Body: JSON `{ "title": "Your question title here" }`
  - Success Response: `201 Created` with JSON object of the created question.
  - Example: `curl -X POST -H "Content-Type: application/json" -d '{"title":"Is Node.js fun?"}' http://localhost:3000/questions/create`

- **`GET /questions/:id`**

  - Description: Retrieves a specific question by its ID, along with its options (including `link_to_vote` for each option).
  - Controller: `question_controller.getQuestion`
  - Params: `:id` (Question's MongoDB ObjectId)
  - Success Response: `200 OK` with JSON object of the question details.
  - Example: `curl http://localhost:3000/questions/60dXXXXXXXXXXXXXXXXXXXXX`

- **`DELETE /questions/:id/delete`**
  - Description: Deletes a specific question by its ID. **Note:** The question can only be deleted if none of its associated options have any votes. All associated options (with 0 votes) will also be deleted.
  - Controller: `question_controller.delete`
  - Params: `:id` (Question's MongoDB ObjectId)
  - Success Response: `200 OK` with a success message.
  - Error Responses: `404 Not Found` (Question not found), `403 Forbidden` (Options have votes).
  - Example: `curl -X DELETE http://localhost:3000/questions/60dXXXXXXXXXXXXXXXXXXXXX/delete`

### Options

- **`POST /options/:id/create`**

  - Description: Creates a new option for a specific question.
  - Controller: `option_controller.create`
  - Params: `:id` (The MongoDB ObjectId of the **Question** to add the option to)
  - Request Body: JSON `{ "text": "Your option text here" }`
  - Success Response: `200 OK` (or ideally `201 Created`) with JSON object of the created option (including `link_to_vote`).
  - Example: `curl -X POST -H "Content-Type: application/json" -d '{"text":"Yes, definitely!"}' http://localhost:3000/options/60dXXXXXXXXXXXXXXXXXXXXX/create`

- **`DELETE /options/:id/delete`**

  - Description: Deletes a specific option by its ID. **Note:** The option can only be deleted if it has 0 votes.
  - Controller: `option_controller.delete`
  - Params: `:id` (The MongoDB ObjectId of the **Option** to delete)
  - Success Response: `200 OK` with a success message.
  - Error Responses: `404 Not Found` (Option not found), `403 Forbidden` (Option has votes).
  - Example: `curl -X DELETE http://localhost:3000/options/60eYYYYYYYYYYYYYYYYYYYYY/delete`

- **`GET /options/:id/add_vote`**
  - Description: Increments the vote count for a specific option by its ID. (**Note:** Using GET for actions that modify data is not standard REST practice; POST or PATCH would be more appropriate, but this reflects the current code.)
  - Controller: `option_controller.addVote`
  - Params: `:id` (The MongoDB ObjectId of the **Option** to vote for)
  - Success Response: `200 OK` with JSON object of the updated option.
  - Example: `curl http://localhost:3000/options/60eYYYYYYYYYYYYYYYYYYYYY/add_vote`

## Technology Stack

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **MongoDB**: NoSQL document database.
- **Mongoose**: Object Data Modeling (ODM) library for MongoDB and Node.js.
- **body-parser**: Middleware to parse incoming request bodies (Note: Modern Express versions often include this functionality built-in).

## Configuration

The primary configuration is the MongoDB connection string, which is currently hardcoded in `config/mongoose.js`:

```javascript
// config/mongoose.js
mongoose.connect("mongodb://127.0.0.1:27017/PollingSys", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```
