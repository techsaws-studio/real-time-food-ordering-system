import "dotenv/config";
import { createServer } from "http";

import { app } from "./app.js";
import { socket } from "./socket.js";

import { ServerExceptionHandler } from "./middlewares/server-exception-handler.js";

import { ConnectMongodb } from "./database/mongoose-database.js";
import { ServerRejectionHandler } from "./middlewares/server-rejection-handler.js";
import { ServerGracefullyShutdownHandler } from "./middlewares/server-gracefully-shutdown-handler.js";

import { StartSessionCleanupJob } from "./utils/session-cleanup.js";

const SERVER = createServer(app);
const PORT = process.env.PORT || 8000;

ServerExceptionHandler();
socket(SERVER);

const StartServer = async (): Promise<void> => {
  try {
    SERVER.listen(PORT, () => {
      console.info(`🕹️  Server is running on port: ${PORT}`);
    });

    await ConnectMongodb();

    StartSessionCleanupJob();

    ServerRejectionHandler(SERVER);
    ServerGracefullyShutdownHandler(SERVER);
  } catch (error) {
    console.error(`⛔ Failed to start the server: ${(error as Error).message}`);
    process.exit(1);
  }
};

StartServer();
