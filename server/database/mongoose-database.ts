import mongoose from "mongoose";
import dotenv from "dotenv";

import { RetryHandler } from "../middlewares/retry-handler.js";

dotenv.config();
export let mongooseConnection: mongoose.Connection | null = null;

const MongodbOperation = async (): Promise<void> => {
  const connection = await mongoose.connect(
    process.env.MONGOOSE_DATABASE_URL || ""
  );

  mongooseConnection = connection.connection;
  console.info(`Mongodb is running on URL: ${connection.connection.host}`);
};

// CONNECT TO MONGOOSE DATABASE
const ConnectMongodb = async (): Promise<void> => {
  try {
    await RetryHandler(MongodbOperation, {
      maxRetries: parseInt(process.env.MAX_RETRIES || "5", 10),
      retryDelay: parseInt(process.env.RETRY_DELAY || "5000", 10),
    });
  } catch (error) {
    console.error(
      `Failed to connect to mongoose database: ${(error as Error).message}`
    );
  }
};

// DISCONNECT MONGOOSE DATABASE
const DisconnectMongodb = async (): Promise<void> => {
  if (mongooseConnection) {
    try {
      await mongooseConnection.close();
      console.info("Mongoose database connection closed successfully.");
      mongooseConnection = null;
    } catch (error) {
      console.error(
        `Error closing mongoose database connection: ${
          (error as Error).message
        }`
      );
    }
  } else {
    console.warn("No mongoose database connection found to close.");
  }
};

export { ConnectMongodb, DisconnectMongodb };
