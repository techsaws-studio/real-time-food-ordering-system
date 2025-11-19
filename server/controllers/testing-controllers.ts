import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import { paymentService } from "../services/payment-service.js";

import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { ErrorHandler } from "../utils/error-handler.js";
import { ApiResponse } from "../utils/api-response-formatter.js";

// BASIC PING FUNCTION
export const PingFunction = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }
);

// ROOT ENDPOINT FUNCTION
export const RootEndpointFunction = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    res.json({
      message: "RTFOS - Real-Time Food Ordering System APIs",
      status: "running",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  }
);

// WEBHOOK TEST ENDPOINT FUNCTION
export const TestWebhook = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "production") {
      throw new ErrorHandler("Test endpoint not available in production", 403);
    }

    const { gateway, paymentId, status } = req.body;

    const payment = await paymentService.getPaymentById(paymentId);

    console.log(
      `[Test Webhook] Simulating ${gateway} webhook for ${paymentId}`
    );

    const result = await paymentService.handleWebhook({
      transactionId: `TEST_${crypto.randomUUID().slice(0, 8)}`,
      status: status || "success",
      failureReason: status === "failed" ? "Test failure" : undefined,
    });

    return ApiResponse.success(
      res,
      {
        gateway,
        paymentId: result.paymentId,
        status: result.status,
        webhookVerified: result.webhookVerified,
        message: "Test webhook processed successfully",
      },
      "Test webhook executed"
    );
  }
);
