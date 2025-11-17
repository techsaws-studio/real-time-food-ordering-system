import { Server, Socket } from "socket.io";

import { SocketErrorHandler } from "../utils/socket-error-handler.js";

export const EventRouters = (io: Server, socket: Socket): void => {
  const register = (event: string, handler: Function): void => {
    handler(io, socket);
    console.info(`🧩 Registered event: ${event} on ${socket.id}`);
  };

  register("errorHandler", () => SocketErrorHandler(socket));
};
