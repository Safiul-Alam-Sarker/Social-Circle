import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BASEURL || "http://localhost:3000";

let socket: Socket | null = null;

export const initializeSocket = (userId: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.emit("join_user", userId);
  }
  return socket;
};

export const getSocket = (): Socket | null => {
  return socket; // Return null instead of throwing error
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
