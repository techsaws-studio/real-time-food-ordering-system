import express from "express";

import {
  PingFunction,
  RootEndpointFunction,
} from "../controllers/testing-controllers.js";

const TestingRouters = express.Router();

TestingRouters.get("/", RootEndpointFunction);
TestingRouters.get("/ping", PingFunction);

export default TestingRouters;
