import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { SocketConfigurations } from "./configs/socket-configurations.js";

import { EventRouters } from "./routes/event-routes.js";

let io: SocketIOServer;

const socket = (server: HttpServer): void => {
  io = SocketConfigurations(server);

  io.on("connection", (socket) => {
    console.info(`✔️ Socket connected: ${socket.id}`);
    EventRouters(io, socket);
  });
};

export { io, socket };
