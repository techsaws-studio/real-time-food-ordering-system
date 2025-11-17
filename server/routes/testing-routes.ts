import express from "express";

import {
  PingFunction,
  RootEndpointFunction,
} from "../controllers/testing-controllers.js";

const TestingRouter = express.Router();

TestingRouter.get("/", RootEndpointFunction);
TestingRouter.get("/ping", PingFunction);

export default TestingRouter;
