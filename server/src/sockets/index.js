import { Server } from 'socket.io';
import { config } from '../config/env.js';

export function registerSocketHandlers(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: config.clientUrl
    }
  });

  io.on('connection', (socket) => {
    socket.on('group:join', ({ groupId }) => {
      socket.join(groupId);
    });

    socket.on('message:send', ({ groupId, message }) => {
      io.to(groupId).emit('message:new', message);
    });

    socket.on('typing:start', ({ groupId, user }) => {
      socket.to(groupId).emit('typing:start', user);
    });

    socket.on('typing:stop', ({ groupId, user }) => {
      socket.to(groupId).emit('typing:stop', user);
    });
  });
}

