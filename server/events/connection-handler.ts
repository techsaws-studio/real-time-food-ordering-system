import { Server } from "socket.io";

import { UserRoleEnum } from "../enums/utils-enums.js";
import { AuthenticatedSocket } from "../types/events-interfaces.js";

import { VerifyJWT } from "../utils/jwt-helper.js";

export const ConnectionHandler = (
  io: Server,
  socket: AuthenticatedSocket
): void => {
  console.log(`🔌 New socket connection: ${socket.id}`);

  socket.on(
    "authenticate",
    async (data: { token: string; type: "customer" | "staff" }) => {
      try {
        if (!data.token) {
          socket.emit("auth:error", {
            message: "Authentication token required",
          });
          return;
        }

        const payload = VerifyJWT(data.token);

        socket.userId = payload.userId;
        socket.sessionId = payload.sessionId;
        socket.tableId = payload.tableId;
        socket.role = payload.role;
        socket.deviceId = payload.deviceId;

        if (data.type === "customer" && socket.sessionId) {
          await socket.join(`session:${socket.sessionId}`);
          if (socket.tableId) {
            await socket.join(`table:${socket.tableId}`);
          }
          console.log(
            `👤 Customer authenticated: ${socket.id} | Session: ${socket.sessionId}`
          );
        } else if (data.type === "staff" && socket.role) {
          await socket.join("staff");

          if (socket.role === UserRoleEnum.ADMIN) {
            await socket.join("admin");
          }
          if (socket.role === UserRoleEnum.KITCHEN) {
            await socket.join("kitchen");
          }
          if (socket.role === UserRoleEnum.RECEPTIONIST) {
            await socket.join("receptionist");
          }

          console.log(
            `👔 Staff authenticated: ${socket.id} | Role: ${socket.role}`
          );
        }

        socket.emit("auth:success", {
          socketId: socket.id,
          sessionId: socket.sessionId,
          tableId: socket.tableId,
          role: socket.role,
          message: "Authentication successful",
        });
      } catch (error: any) {
        console.error(
          `❌ Authentication failed for ${socket.id}:`,
          error.message
        );
        socket.emit("auth:error", {
          message: error.message || "Authentication failed",
        });
      }
    }
  );

  socket.on("subscribe:order", async (data: { orderId: string }) => {
    if (!socket.sessionId) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }

    await socket.join(`order:${data.orderId}`);
    socket.emit("subscribed", {
      room: `order:${data.orderId}`,
      message: "Subscribed to order updates",
    });
    console.log(`📦 Socket ${socket.id} subscribed to order:${data.orderId}`);
  });

  socket.on("subscribe:bill", async (data: { billId: string }) => {
    if (!socket.sessionId) {
      socket.emit("error", { message: "Not authenticated" });
      return;
    }

    await socket.join(`bill:${data.billId}`);
    socket.emit("subscribed", {
      room: `bill:${data.billId}`,
      message: "Subscribed to bill updates",
    });
    console.log(`💰 Socket ${socket.id} subscribed to bill:${data.billId}`);
  });

  socket.on("unsubscribe:order", async (data: { orderId: string }) => {
    await socket.leave(`order:${data.orderId}`);
    socket.emit("unsubscribed", { room: `order:${data.orderId}` });
    console.log(
      `📦 Socket ${socket.id} unsubscribed from order:${data.orderId}`
    );
  });

  socket.on("unsubscribe:bill", async (data: { billId: string }) => {
    await socket.leave(`bill:${data.billId}`);
    socket.emit("unsubscribed", { room: `bill:${data.billId}` });
    console.log(`💰 Socket ${socket.id} unsubscribed from bill:${data.billId}`);
  });

  socket.on("subscribe:kitchen-dashboard", async () => {
    if (
      socket.role !== UserRoleEnum.KITCHEN &&
      socket.role !== UserRoleEnum.ADMIN
    ) {
      socket.emit("error", { message: "Unauthorized: Kitchen staff only" });
      return;
    }

    await socket.join("kitchen-dashboard");
    socket.emit("subscribed", {
      room: "kitchen-dashboard",
      message: "Subscribed to kitchen dashboard updates",
    });
    console.log(`👨‍🍳 Socket ${socket.id} subscribed to kitchen-dashboard`);
  });

  socket.on("subscribe:admin-dashboard", async () => {
    if (socket.role !== UserRoleEnum.ADMIN) {
      socket.emit("error", { message: "Unauthorized: Admin only" });
      return;
    }

    await socket.join("admin-dashboard");
    socket.emit("subscribed", {
      room: "admin-dashboard",
      message: "Subscribed to admin dashboard updates",
    });
    console.log(`🔐 Socket ${socket.id} subscribed to admin-dashboard`);
  });

  socket.on("disconnect", (reason: string) => {
    console.log(`🔌 Socket disconnected: ${socket.id} | Reason: ${reason}`);

    if (socket.sessionId) {
      socket.leave(`session:${socket.sessionId}`);
    }
    if (socket.tableId) {
      socket.leave(`table:${socket.tableId}`);
    }
    socket.leave("staff");
    socket.leave("kitchen");
    socket.leave("admin");
    socket.leave("receptionist");
  });

  socket.on("ping", () => {
    socket.emit("pong", {
      timestamp: new Date().toISOString(),
      socketId: socket.id,
    });
  });

  socket.on("error", (error: Error) => {
    console.error(`⚠️ Socket error [${socket.id}]:`, error.message);
    socket.emit("error", {
      message: "An error occurred",
      timestamp: new Date().toISOString(),
    });
  });
};
