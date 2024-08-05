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

// Load environment variables from.env file
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON bodies and cookies
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/login', loginRoute);
app.use('/', indexRoute);
app.use('/api', getUsers);
app.use('/api', getWorkspaces);

// Start the server
const server = app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}/`);
});

// Initialize Socket.io
global.io = initSocket(server);

// Watch for changes in the Source collection
watchSources();