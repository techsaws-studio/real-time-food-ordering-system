import { Router } from "express";

import {
  HandleEasypaisaWebhook,
  HandleJazzCashWebhook,
  HandleMastercardWebhook,
  VerifyWebhookSignature,
  GetWebhookStatus,
} from "../controllers/webhook-controllers.js";

import { ValidateRequest } from "../middlewares/validation-middleware.js";
import { VerifyStaffAuth } from "../middlewares/auth-middleware.js";
import { RequireAdmin } from "../middlewares/role-middleware.js";

import {
  EasypaisaWebhookSchema,
  JazzCashWebhookSchema,
  MastercardWebhookSchema,
  VerifyWebhookSignatureSchema,
} from "../validators/payment-validators.js";

const WebhookRouter = Router();

/* NOTE: These endpoints are NOT authenticated because they receive callbacks from external payment gateways. Security is ensured via signature verification. */

// PUBLIC ROUTES
WebhookRouter.post(
  "/easypaisa",
  ValidateRequest(EasypaisaWebhookSchema),
  HandleEasypaisaWebhook
);
WebhookRouter.post(
  "/jazzcash",
  ValidateRequest(JazzCashWebhookSchema),
  HandleJazzCashWebhook
);
WebhookRouter.post(
  "/mastercard",
  ValidateRequest(MastercardWebhookSchema),
  HandleMastercardWebhook
);

// ADMIN-PROTECTED ROUTES
WebhookRouter.get("/status", VerifyStaffAuth, RequireAdmin, GetWebhookStatus);
WebhookRouter.post(
  "/verify-signature",
  VerifyStaffAuth,
  RequireAdmin,
  ValidateRequest(VerifyWebhookSignatureSchema),
  VerifyWebhookSignature
);

export default WebhookRouter;
