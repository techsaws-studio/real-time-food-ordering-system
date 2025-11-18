import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";

import { CorsConfigurations } from "./configs/cors-configurations.js";

import { AppErrorHandler } from "./middlewares/app-error-handler.js";

import TestingRouter from "./routes/testing-routes.js";
import AuthRouter from "./routes/auth-routes.js";
import UserRouter from "./routes/user-routes.js";
import TableRouter from "./routes/table-routes.js";

export const app = express();

app.set("trust proxy", 1);
app.use(cors(CorsConfigurations));
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// API ROUTES PATH
app.use("/", TestingRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/users", UserRouter);
app.use("/api/tables", TableRouter);

// ERROR HANDLER
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error: ${err.message}`);
  AppErrorHandler(err, req, res, next);
});
