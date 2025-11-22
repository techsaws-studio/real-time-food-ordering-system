import { Server, Socket } from "socket.io";

import { SocketErrorHandler } from "../utils/socket-error-handler.js";

import { OrderEvents } from "../events/order-events.js";
import { KitchenEvents } from "../events/kitchen-events.js";
import { TableEvents } from "../events/table-events.js";
import { BillEvents } from "../events/bill-events.js";
import { NotificationEvents } from "../events/notification-events.js";
import { ConnectionHandler } from "../events/connection-handler.js";

export const EventRouters = (io: Server, socket: Socket): void => {
  console.log(`🎯 Registering event handlers for socket: ${socket.id}`);

  const register = (moduleName: string, handler: Function): void => {
    try {
      handler(io, socket);
      console.info(`✅ Registered ${moduleName} events on ${socket.id}`);
    } catch (error: any) {
      console.error(
        `❌ Failed to register ${moduleName} events:`,
        error.message
      );
    }
  };

  register("ErrorHandler", () => SocketErrorHandler(socket));
  register("OrderEvents", () => OrderEvents(io, socket));
  register("KitchenEvents", () => KitchenEvents(io, socket));
  register("TableEvents", () => TableEvents(io, socket));
  register("BillEvents", () => BillEvents(io, socket));
  register("NotificationEvents", () => NotificationEvents(io, socket));
  register("ConnectionHandler", () => ConnectionHandler(io, socket));

  socket.on("connect", () => {
    console.log(`🟢 Socket connected: ${socket.id}`);
  });

  socket.on("disconnect", (reason: string) => {
    console.log(`🔴 Socket disconnected: ${socket.id} | Reason: ${reason}`);
  });

  socket.on("error", (error: Error) => {
    console.error(`⚠️ Socket error [${socket.id}]:`, error.message);
  });

  console.log(
    `🎉 All event handlers registered successfully for socket: ${socket.id}`
  );
};
