import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket = null;
let currentToken = null;

// Create or reuse Socket.IO connection
export const createSocket = () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    console.log("No authentication token found");
    return null;
  }

  // Reuse socket if the token is unchanged
  if (socket && currentToken === token) {
    return socket;
  }

  // Disconnect old socket if token has changed
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentToken = token;

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return socket;
};

// Get existing socket
export const getSocket = () => {
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentToken = null;
    console.log("Socket disconnected successfully");
  }
};