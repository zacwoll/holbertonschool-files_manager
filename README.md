# Files Manager

Files Manager is a back-end solution that enables users to upload and view files on a server. The project employs cutting-edge technologies such as Node.js, Express, Redis, MongoDB, and Chai for testing. It offers various features, including user authentication, file management, permission control, image thumbnail generation, and more.

## Features

- User authentication with tokens
- List all files
- Upload new files
- Change file permissions
- View files
- Generate image thumbnails

## Technologies

- Node.js: A powerful JavaScript runtime environment built on Chrome's V8 JavaScript engine, designed to build scalable network applications.
- Express: A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- Redis: An open-source, in-memory data structure store, used as a database, cache, and message broker. It is employed in this project to remember users.
- MongoDB: A popular NoSQL database that uses a flexible, JSON-like schema for storing data. In this project, it hosts user and file data.
- Chai: A BDD/TDD assertion library for Node.js and the browser that can be used with any testing framework. It is utilized in this project to test the code.

## Project Structure

The project is organized as follows:

- `controllers`: Contains the controller files that handle various application logic.
- `routes`: Contains the route files that define the API endpoints.
- `tests`: Contains the test files using the Chai testing library.
- `utils`: Contains utility functions and modules.
- `server.js`: Sets up the Express server and middleware.
- `main.js`: The entry point of the application that starts the server.

## Getting Started

To set up the project, follow these steps:

1. Install Node.js and npm (the Node.js package manager) on your machine.
2. Clone this repository and navigate to the project folder.
3. Install the required dependencies by running `npm install`.
4. Set up your MongoDB and Redis instances.
6. Start the server by running `npm start`.

## Testing

This project uses the Chai assertion library for testing. To run the tests, execute the command `npm test`.

## Contributing

Feel free to contribute to this project by submitting pull requests or reporting issues.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

Files Manager is a practical project designed to provide a solid foundation for learning and understanding key concepts of Node.js, Express, Redis, MongoDB, and Chai, by assembling various technologies to build a full-featured product.
