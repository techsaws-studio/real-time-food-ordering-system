import { Router } from "express";

import {
  CreatePaymentIntent,
  GetPaymentById,
  GetPaymentByIdempotencyKey,
  GetPaymentsByBill,
  GetPaymentsByStatus,
  GetPendingPayments,
  ProcessPayment,
  ConfirmPayment,
  FailPayment,
  RefundPayment,
  CancelPayment,
  RetryFailedPayment,
  GetPaymentStats,
  GetPaymentsByDateRange,
  GetCustomerPaymentStatus,
  InitiateCustomerPayment,
} from "../controllers/payment-controllers.js";

import { ValidateRequest } from "../middlewares/validation-middleware.js";
import {
  VerifyStaffAuth,
  VerifyCustomerSession,
} from "../middlewares/auth-middleware.js";
import { RequireAdmin, RequireStaff } from "../middlewares/role-middleware.js";
import { VerifyActiveSession } from "../middlewares/session-middleware.js";

import {
  CreatePaymentIntentSchema,
  GetPaymentByIdSchema,
  GetPaymentByIdempotencyKeySchema,
  GetPaymentsByBillSchema,
  GetPaymentsByStatusSchema,
  GetPendingPaymentsSchema,
  ProcessPaymentSchema,
  ConfirmPaymentSchema,
  FailPaymentSchema,
  RefundPaymentSchema,
  CancelPaymentSchema,
  RetryFailedPaymentSchema,
  GetPaymentStatsSchema,
  GetPaymentsByDateRangeSchema,
} from "../validators/payment-validators.js";

const PaymentRouter = Router();
PaymentRouter.use(VerifyStaffAuth);

// PUBLIC ROUTES
PaymentRouter.get(
  "/status/:paymentId",
  VerifyCustomerSession,
  VerifyActiveSession,
  ValidateRequest(GetPaymentByIdSchema),
  GetCustomerPaymentStatus
);
PaymentRouter.post(
  "/initiate",
  VerifyCustomerSession,
  VerifyActiveSession,
  ValidateRequest(CreatePaymentIntentSchema),
  InitiateCustomerPayment
);

// STAFF-PROTECTED ROUTES
PaymentRouter.get(
  "/stats",
  RequireStaff,
  ValidateRequest(GetPaymentStatsSchema),
  GetPaymentStats
);
PaymentRouter.get(
  "/date-range",
  RequireStaff,
  ValidateRequest(GetPaymentsByDateRangeSchema),
  GetPaymentsByDateRange
);
PaymentRouter.get(
  "/pending",
  RequireStaff,
  ValidateRequest(GetPendingPaymentsSchema),
  GetPendingPayments
);
PaymentRouter.get(
  "/idempotency",
  RequireStaff,
  ValidateRequest(GetPaymentByIdempotencyKeySchema),
  GetPaymentByIdempotencyKey
);
PaymentRouter.get(
  "/status/:status",
  RequireStaff,
  ValidateRequest(GetPaymentsByStatusSchema),
  GetPaymentsByStatus
);
PaymentRouter.get(
  "/bill/:billId",
  RequireStaff,
  ValidateRequest(GetPaymentsByBillSchema),
  GetPaymentsByBill
);
PaymentRouter.post(
  "/",
  RequireStaff,
  ValidateRequest(CreatePaymentIntentSchema),
  CreatePaymentIntent
);
PaymentRouter.get(
  "/:paymentId",
  RequireStaff,
  ValidateRequest(GetPaymentByIdSchema),
  GetPaymentById
);
PaymentRouter.post(
  "/:paymentId/process",
  RequireStaff,
  ValidateRequest(ProcessPaymentSchema),
  ProcessPayment
);
PaymentRouter.post(
  "/:paymentId/confirm",
  RequireStaff,
  ValidateRequest(ConfirmPaymentSchema),
  ConfirmPayment
);
PaymentRouter.post(
  "/:paymentId/fail",
  RequireStaff,
  ValidateRequest(FailPaymentSchema),
  FailPayment
);
PaymentRouter.post(
  "/:paymentId/cancel",
  RequireStaff,
  ValidateRequest(CancelPaymentSchema),
  CancelPayment
);
PaymentRouter.post(
  "/:paymentId/retry",
  RequireStaff,
  ValidateRequest(RetryFailedPaymentSchema),
  RetryFailedPayment
);

// ADMIN-ONLY ROUTES
PaymentRouter.post(
  "/:paymentId/refund",
  RequireAdmin,
  ValidateRequest(RefundPaymentSchema),
  RefundPayment
);

export default PaymentRouter;
