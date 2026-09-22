import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

let socket = null;

export const createSocket = () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    console.log("No authentication token found");
    return null;
  }

  // Already connected socket reuse karo
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};