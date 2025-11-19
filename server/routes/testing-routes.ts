import express from "express";

import {
  PingFunction,
  RootEndpointFunction,
  TestWebhook,
} from "../controllers/testing-controllers.js";

import { VerifyStaffAuth } from "../middlewares/auth-middleware.js";
import { RequireAdmin } from "../middlewares/role-middleware.js";

const TestingRouter = express.Router();

TestingRouter.get("/", RootEndpointFunction);
TestingRouter.get("/ping", PingFunction);
TestingRouter.post("/webhook-test", VerifyStaffAuth, RequireAdmin, TestWebhook);

export default TestingRouter;
