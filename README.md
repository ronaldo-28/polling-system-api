# Polling System API

A simple Node.js API built with Express and Mongoose for creating questions, adding options, and voting on options.

## Features

- Create new questions.
- Add options to existing questions.
- View a specific question with its options.
- View all questions with their options.
- Add a vote to an option.
- Delete questions (only if none of its options have votes).
- Delete options (only if the option has zero votes).

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/try/download/community) (Make sure a MongoDB server instance is running)

## Setup and Installation

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Ensure MongoDB is running:**
    Make sure your local MongoDB server is running on the default port (27017). The application will try to connect to the `PollingSys` database.

4.  **Start the server:**
    ```bash
    node index.js
    ```
    The server should start running on `http://localhost:3000` (or the port specified in `index.js`). You'll see a confirmation message in the console: `Server is running successfully at port: 3000`.

## Configuration

- **Database Connection:** The MongoDB connection string is configured in `config/mongoose.js`. By default, it connects to `mongodb://127.0.0.1:27017/PollingSys`. Modify this file if your MongoDB instance runs elsewhere or requires authentication.

## API Endpoints

The base URL for the API is `http://localhost:3000`.

**Home**

- `GET /`
  - Description: Retrieves a list of all questions, with their associated options populated.
  - Response: `200 OK` - JSON array of question objects. `500 Internal Server Error` on failure.

**Questions**

- `POST /questions/create`

  - Description: Creates a new question.
  - Request Body: JSON `{"title": "Your question title here"}`
  - Response: `201 Created` - JSON object of the newly created question. `400 Bad Request` if title is missing. `500 Internal Server Error` on failure.

- `GET /questions/:id`

  - Description: Retrieves a specific question by its ID, along with its options. Each option will include a dynamically generated `link_to_vote`.
  - Parameters: `:id` - The MongoDB ObjectId of the question.
  - Response: `200 OK` - JSON object containing the question details and options. `404 Not Found` if question doesn't exist. `400 Bad Request` for invalid ID format. `500 Internal Server Error` on failure.

- `DELETE /questions/:id/delete`
  - Description: Deletes a specific question and its associated options. **Constraint:** The question can only be deleted if _none_ of its options have received any votes.
  - Parameters: `:id` - The MongoDB ObjectId of the question.
  - Response: `200 OK` - Success message. `404 Not Found` if question doesn't exist. `403 Forbidden` if any option has votes. `400 Bad Request` for invalid ID format. `500 Internal Server Error` on failure.

**Options**

- `POST /questions/:id/options/create`

  - Description: Creates a new option and associates it with the specified question.
  - Parameters: `:id` - The MongoDB ObjectId of the **question** to add the option to.
  - Request Body: JSON `{"text": "Your option text here"}`
  - Response: `200 OK` - JSON object of the newly created option (including `link_to_vote`). `404 Not Found` if the question doesn't exist. `500 Internal Server Error` on failure.
  - _Note: This route is defined via `routes/question.js` mounting `routes/option.js` with the path `/options`. The corresponding controller is `option_controller.create`._

- `DELETE /options/:id/delete`

  - Description: Deletes a specific option. **Constraint:** The option can only be deleted if it has _zero_ votes.
  - Parameters: `:id` - The MongoDB ObjectId of the **option** to delete.
  - Response: `200 OK` - Success message. `404 Not Found` if option doesn't exist. `403 Forbidden` if the option has votes. `500 Internal Server Error` on failure.

- `GET /options/:id/add_vote`
  - Description: Increments the vote count for a specific option by one.
  - Parameters: `:id` - The MongoDB ObjectId of the **option** to vote for.
  - Response: `200 OK` - JSON object of the updated option. `404 Not Found` if option doesn't exist. `500 Internal Server Error` on failure.
  - _Note: Using GET for an action that modifies data is generally not best practice (POST/PUT/PATCH is preferred), but it's implemented this way here._

## Technologies Used

- Node.js
- Express.js
- Mongoose (MongoDB ODM)
- MongoDB
