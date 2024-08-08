const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const initSocket = require('./config/socket');
const watchSources = require('./utils/notificationHandler');
const cookieParser = require('cookie-parser');
const sessionMiddleware = require('./middleware/sessionMiddleware');
const loginRoute = require('./routes/login');
const indexRoute = require('./routes/index');
const getUsers = require('./routes/getUsersByWorkspaceId');
const getWorkspaces = require('./routes/getWorkspacesByUserId');
const manipulateSources = require('./routes/manipulateSources');

// Load environment variables from .env file
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.use('/login', loginRoute);                // Handle user login
app.use('/', indexRoute);                     // Serve the home or login page based on session
app.use('/api', getUsers);                    // Get users by workspace ID
app.use('/api', getWorkspaces);               // Get workspaces by user ID
app.use('/', manipulateSources);              // Manipulate sources (create, update, delete)

// Start the server and listen on the specified port
const server = app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}/`);
});

// Initialize Socket.io for real-time communication
global.io = initSocket(server);

// Watch for changes in the Source collection to send notifications
const changeStream = watchSources();

// Gracefully handle server shutdown
process.on('SIGINT', async () => {
  try {
    // Close the change stream
    if (changeStream) {
      await changeStream.close();
      console.log('Change stream closed');
    }

    // Close Redis connection if open
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }

    // Close MongoDB connection if open
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }

    // Close the HTTP server
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0); // Exit the process with a success code
    });

  } catch (err) {
    console.error('Error occurred while shutting down:', err);
    process.exit(1); // Exit the process with an error code
  }
});