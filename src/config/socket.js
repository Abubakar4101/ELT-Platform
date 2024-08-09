const { Server } = require('socket.io');
const redisClient = require('./redis');
const { getWorkspacesByUserId } = require('../routes/getWorkspacesByUserId');


/**
 * Initialize Socket.io
 * @param {Server} server - HTTP server instance
 * @returns {Server} - Initialized Socket.io server
 */
const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins
      methods: ['GET', 'POST'], // Allow GET and POST methods
    },
  });

  // Variable to keep track of the workspace the user has joined
  let joinedWorkspace = '';

  // Event listener for a new client connection
  io.on('connection', async (socket) => {
    
    const workspaces = await getWorkspacesByUserId(socket.handshake.query.userId);
    if(workspaces && workspaces.length > 0) {
      workspaces.forEach(async workspace => {
        // Join the specified workspace room
        socket.join(workspace._id.toString());
        joinedWorkspace = workspace._id.toString();
  
        // Fetch and emit missed events for the user from Redis
        const missedEvents = await redisClient.lRange(`missedEvents:${workspace._id.toString()}:${socket.handshake.query.userId}`, 0, -1);
        if (missedEvents) {
          missedEvents.forEach(notification => {
            // Emit each missed notification to the client with a timeout for acknowledgment
            socket.emit('notification', JSON.parse(notification));
          });
        }
        else{
          console.log('No events found');
        }
        console.log(`User joined workspace: ${workspace._id.toString()}`);
  
      });
    }

    // Event listener for acknowledgment of notifications
    socket.on('acknowledged', (acknowledged, userId, notification) => {
      console.log(`User acknowledge: ${acknowledged}, ${userId}, ${notification}, ${joinedWorkspace}`);
      if (acknowledged) {
        // Remove the acknowledged notification from Redis
        redisClient.lRem(`missedEvents:${joinedWorkspace}:${userId}`, 0, JSON.stringify(notification));
      }
      else {
        console.log('Acknowledgment failed');
      }
    });

    // Event listener for leaving a workspace room
    socket.on('leaveWorkspace', (workspaceId) => {
      socket.leave(workspaceId);
      console.log(`User left workspace: ${workspaceId}`);
    });

    // Event listener for client disconnection
    socket.on('disconnect', (userId) => {
      console.log('Client disconnected:', socket.id, 'User disconnected', socket.handshake.query.userId);
    });
  });

  return io;
};

module.exports = initSocket;
