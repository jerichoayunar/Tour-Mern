# Backend Documentation

## Overview
The backend is built with **Node.js** and **Express**, using **MongoDB** as the database. It follows a modular structure to keep code organized and maintainable.

## Key Files & Folders

### `server.js`
This is the **entry point** of the application. It:
1.  **Loads Environment Variables:** Reads `.env` for secrets like database passwords.
2.  **Connects to Database:** Calls `connectDB()` to start the MongoDB connection.
3.  **Sets up Middleware:**
    *   `helmet`: Adds security headers.
    *   `cors`: Allows the frontend to talk to the backend.
    *   `compression`: Makes responses smaller/faster.
    *   `express.json()`: Allows the server to understand JSON data sent by the frontend.
4.  **Registers Routes:** Connects URL paths (like `/api/auth`) to their route handlers.
5.  **Starts the Server:** Listens on port 5000 (or whatever is in `.env`).

### `config/`
*   `db.js`: Handles the connection logic to MongoDB.
*   `googleOAuth.js`: Configuration for Google Login.

### `controllers/`
Contains the **logic** for each route.
*   *Example:* `authController.js` has functions like `register`, `login`, `getMe`.
*   It receives the request (`req`), does the work (often calling a Service), and sends the response (`res`).

### `services/`
Contains the **business logic**.
*   *Example:* `authService.js` handles creating the user in the database, hashing passwords, etc.
*   This keeps the Controllers clean and focused on HTTP stuff.

### `routes/`
Defines the **URL paths**.
*   *Example:* `authRoutes.js` says that `POST /register` should go to `authController.register`.

### `middleware/`
Functions that run **before** the controller.
*   `authMiddleware.js`: Checks if a user is logged in (`protect`) and if they are an admin (`admin`).
*   `errorMiddleware.js`: Catches errors and sends a nice JSON response instead of crashing.
*   `rateLimit.js`: Prevents users from spamming the API.

### `models/`
Defines the **Database Schema** (structure of data).
*   `User.js`: Defines what a User looks like (name, email, password, role).
*   `Package.js`: Defines what a Tour Package looks like.

## Common Flows

### 1. User Login
1.  **Frontend** sends `POST /api/auth/login` with email/password.
2.  **Server** receives request in `server.js`.
3.  **Router** (`authRoutes.js`) sends it to `authController.login`.
4.  **Controller** calls `authService.loginUser`.
5.  **Service** checks database (`User` model), verifies password, and generates a Token.
6.  **Controller** sends the Token back to Frontend.

### 2. Admin Viewing Bookings
1.  **Frontend** sends `GET /api/bookings` with the Token.
2.  **Router** (`bookingRoutes.js`) runs `protect` and `admin` middleware.
3.  **Middleware** verifies the Token and checks if role is 'admin'.
4.  **Controller** (`bookingController.getAllBookings`) gets data from DB.
5.  **Controller** sends list of bookings to Frontend.
