import "dotenv/config";
import cors from "cors";

import { AllowedOrigins } from "./allowed-origins.js";

export const CorsConfigurations: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = AllowedOrigins();

    if (process.env.NODE_ENV !== "production") {
      console.log(`🔓 DEV MODE: Allowing origin: ${origin || "no-origin"}`);
      return callback(null, true);
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ BLOCKED: ${origin}`);
      callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
  maxAge: 86400,
};
