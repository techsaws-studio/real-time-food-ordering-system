import "dotenv/config";
import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

import { ISocketConfigurations } from "../types/configs-interfaces.js";

import { AllowedOrigins } from "./allowed-origins.js";

const GetSocketConfigurations = (): ISocketConfigurations => {
  return {
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 60000,
    maxHttpBufferSize: 10 * 1024 * 1024,
    allowUpgrades: true,
    transports: ["websocket", "polling"] as ("websocket" | "polling")[],
  };
};

export const SocketConfigurations = (server: HttpServer): SocketIOServer => {
  const allowedOrigins = AllowedOrigins();
  const socketConfigs = GetSocketConfigurations();
  const isDevelopment = process.env.NODE_ENV !== "production";

  console.log(`🔌 Initializing Socket Server...`);

  const io = new SocketIOServer(server, {
    cors: {
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, success?: boolean) => void
      ) => {
        if (isDevelopment) {
          console.log(
            `🔌 DEV MODE: Allowing socket origin: ${origin || "no-origin"}`
          );
          return callback(null, true);
        }

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          console.log(`⛔ Socket CORS BLOCKED: ${origin}`);
          callback(
            new Error(`Socket CORS: Origin ${origin} not allowed`),
            false
          );
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
    },

    pingTimeout: socketConfigs.pingTimeout,
    pingInterval: socketConfigs.pingInterval,
    connectTimeout: socketConfigs.connectTimeout,
    maxHttpBufferSize: socketConfigs.maxHttpBufferSize,
    allowUpgrades: socketConfigs.allowUpgrades,
    transports: socketConfigs.transports,

    path: "/socket.io",
    cleanupEmptyChildNamespaces: true,

    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
      skipMiddlewares: true,
    },
  });

  let connectionCount = 0;

  io.on("connection", (socket) => {
    connectionCount++;

    const clientInfo = {
      id: socket.id,
      origin: socket.handshake.headers.origin,
      ip: socket.handshake.address,
    };

    console.log(`🔌 Socket connected [${connectionCount}]:`, {
      id: clientInfo.id,
      origin: clientInfo.origin || "no-origin",
      ip: clientInfo.ip,
    });

    socket.on("disconnect", (reason: string) => {
      connectionCount--;
      console.log(`🔌 Socket disconnected [${connectionCount}]:`, {
        id: socket.id,
        reason,
        origin: clientInfo.origin || "no-origin",
      });
    });

    socket.on("error", (error: Error) => {
      console.error(`⚠️ Socket Error [${socket.id}]:`, error.message);
    });
  });

  io.engine.on("connection_error", (err: any) => {
    console.error(`⚠️ Socket Engine Connection Error:`, err.message);
  });

  io.engine.on("error", (error: Error) => {
    console.error(`⚠️ Socket Engine Error:`, error.message);
  });

  console.log(`✔️  Socket server initialized successfully.`);
  return io;
};
