import { Server } from "http";

import { DisconnectMongodb } from "../database/mongoose-database.js";

export const ServerGracefullyShutdownHandler = (server: Server): void => {
  process.on("SIGINT", async () => {
    console.info("Shutting down gracefully...");

    await DisconnectMongodb();

    server.close(() => {
      console.info("HTTP server closed.");
      process.exit(0);
    });
  });
};
