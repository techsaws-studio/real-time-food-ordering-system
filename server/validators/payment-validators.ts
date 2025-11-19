import { z } from "zod";

import { PaymentMethodEnum, PaymentStatusEnum } from "../enums/models-enums.js";

// CREATE PAYMENT INTENT
export const CreatePaymentIntentSchema = z.object({
  body: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),

    method: z.nativeEnum(PaymentMethodEnum, {
      message: `Payment method must be one of: ${Object.values(
        PaymentMethodEnum
      ).join(", ")}`,
    }),

    returnUrl: z
      .string()
      .url("Invalid return URL format")
      .optional()
      .describe("URL to redirect after payment completion"),

    cancelUrl: z
      .string()
      .url("Invalid cancel URL format")
      .optional()
      .describe("URL to redirect if payment is cancelled"),
  }),
});

// GET PAYMENT BY ID
export const GetPaymentByIdSchema = z.object({
  params: z.object({
    paymentId: z
      .string({ message: "Payment ID is required" })
      .uuid("Invalid payment ID format"),
  }),
});

// GET PAYMENT BY IDEMPOTENCY KEY
export const GetPaymentByIdempotencyKeySchema = z.object({
  query: z.object({
    idempotencyKey: z
      .string({ message: "Idempotency key is required" })
      .uuid("Invalid idempotency key format"),
  }),
});

// GET PAYMENTS BY BILL
export const GetPaymentsByBillSchema = z.object({
  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),

  query: z.object({
    status: z
      .nativeEnum(PaymentStatusEnum, {
        message: `Status must be one of: ${Object.values(
          PaymentStatusEnum
        ).join(", ")}`,
      })
      .optional(),
  }),
});

// GET PAYMENTS BY STATUS
export const GetPaymentsByStatusSchema = z.object({
  params: z.object({
    status: z.nativeEnum(PaymentStatusEnum, {
      message: `Status must be one of: ${Object.values(PaymentStatusEnum).join(
        ", "
      )}`,
    }),
  }),

  query: z.object({
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int("Limit must be an integer")
          .min(1, "Limit must be at least 1")
          .max(500, "Limit cannot exceed 500")
      )
      .optional(),

    offset: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int("Offset must be an integer")
          .min(0, "Offset cannot be negative")
      )
      .optional()
      .default("0" as any),
  }),
});

// PROCESS PAYMENT
export const ProcessPaymentSchema = z.object({
  body: z.object({
    transactionId: z
      .string({ message: "Transaction ID is required" })
      .min(1, "Transaction ID cannot be empty")
      .max(255, "Transaction ID cannot exceed 255 characters")
      .trim(),

    gatewayResponse: z
      .record(z.string(), z.any())
      .optional()
      .describe("Raw response from payment gateway"),
  }),

  params: z.object({
    paymentId: z
      .string({ message: "Payment ID is required" })
      .uuid("Invalid payment ID format"),
  }),
});

// CONFIRM PAYMENT (AFTER WEBHOOK)
export const ConfirmPaymentSchema = z.object({
  body: z.object({
    webhookVerified: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether webhook signature was verified"),
  }),

  params: z.object({
    paymentId: z
      .string({ message: "Payment ID is required" })
      .uuid("Invalid payment ID format"),
  }),
});

// FAIL PAYMENT
export const FailPaymentSchema = z.object({
  body: z.object({
    failureReason: z
      .string({ message: "Failure reason is required" })
      .min(5, "Failure reason must be at least 5 characters")
      .max(500, "Failure reason cannot exceed 500 characters")
      .trim(),

    errorCode: z
      .string()
      .max(50, "Error code cannot exceed 50 characters")
      .trim()
      .optional(),

    gatewayResponse: z
      .record(z.string(), z.any())
      .optional()
      .describe("Raw response from payment gateway"),
  }),

  params: z.object({
    paymentId: z
      .string({ message: "Payment ID is required" })
      .uuid("Invalid payment ID format"),
  }),
});

// REFUND PAYMENT
export const RefundPaymentSchema = z.object({
  body: z.object({
    refundReason: z
      .string({ message: "Refund reason is required" })
      .min(5, "Refund reason must be at least 5 characters")
      .max(500, "Refund reason cannot exceed 500 characters")
      .trim(),

    refundAmount: z
      .number()
      .positive("Refund amount must be greater than 0")
      .max(999999.99, "Refund amount cannot exceed 999,999.99")
      .multipleOf(0.01, "Refund amount must have at most 2 decimal places")
      .optional()
      .describe("Partial refund amount. Leave empty for full refund."),

    refundedBy: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
  }),

  params: z.object({
    paymentId: z
      .string({ message: "Payment ID is required" })
      .uuid("Invalid payment ID format"),
  }),
});

// WEBHOOK HANDLER - EASYPAISA
export const EasypaisaWebhookSchema = z.object({
  body: z.object({
    transactionId: z
      .string({ message: "Transaction ID is required" })
      .min(1, "Transaction ID cannot be empty"),

    orderId: z
      .string({ message: "Order ID is required" })
      .min(1, "Order ID cannot be empty"),

    amount: z
      .number({ message: "Amount is required" })
      .positive("Amount must be greater than 0"),

    status: z.enum(["success", "failed", "pending"], {
      message: "Status must be one of: success, failed, pending",
    }),

    paymentMethod: z.string().optional(),

    timestamp: z
      .string({ message: "Timestamp is required" })
      .datetime("Invalid timestamp format"),

    signature: z
      .string({ message: "Signature is required" })
      .min(1, "Signature cannot be empty")
      .describe("HMAC signature for verification"),

    msisdn: z.string().optional().describe("Customer phone number"),
    merchantId: z.string().optional(),
  }),

  headers: z.object({
    "x-easypaisa-signature": z
      .string({ message: "Signature header is required" })
      .optional(),
  }),
});

// WEBHOOK HANDLER - JAZZCASH
export const JazzCashWebhookSchema = z.object({
  body: z.object({
    pp_TxnRefNo: z
      .string({ message: "Transaction reference is required" })
      .min(1, "Transaction reference cannot be empty"),

    pp_Amount: z
      .string({ message: "Amount is required" })
      .min(1, "Amount cannot be empty")
      .transform((val) => parseFloat(val)),

    pp_ResponseCode: z
      .string({ message: "Response code is required" })
      .min(1, "Response code cannot be empty"),

    pp_ResponseMessage: z.string().optional(),

    pp_BillReference: z
      .string({ message: "Bill reference is required" })
      .min(1, "Bill reference cannot be empty"),

    pp_SecureHash: z
      .string({ message: "Secure hash is required" })
      .min(1, "Secure hash cannot be empty")
      .describe("SHA256 hash for verification"),

    // Additional JazzCash fields
    pp_TxnDateTime: z.string().optional(),
    pp_TxnCurrency: z.string().optional(),
    pp_MerchantID: z.string().optional(),
  }),
});

// WEBHOOK HANDLER - MASTERCARD/STRIPE
export const MastercardWebhookSchema = z.object({
  body: z.object({
    id: z
      .string({ message: "Event ID is required" })
      .min(1, "Event ID cannot be empty"),

    type: z.enum(
      [
        "payment_intent.succeeded",
        "payment_intent.payment_failed",
        "charge.succeeded",
        "charge.failed",
        "charge.refunded",
      ],
      {
        message: "Invalid webhook event type",
      }
    ),

    data: z.object({
      object: z.object({
        id: z.string().min(1, "Payment ID cannot be empty"),
        amount: z.number().positive("Amount must be greater than 0"),
        currency: z.string().length(3, "Currency must be 3 characters"),
        status: z.string().min(1, "Status cannot be empty"),
        metadata: z
          .record(z.string(), z.string())
          .optional()
          .describe("Custom metadata including billId"),
      }),
    }),

    created: z.number().int("Created timestamp must be an integer"),
  }),

  headers: z.object({
    "stripe-signature": z
      .string({ message: "Stripe signature header is required" })
      .optional(),
  }),
});

// VERIFY WEBHOOK SIGNATURE (GENERIC)
export const VerifyWebhookSignatureSchema = z.object({
  body: z.object({
    payload: z
      .string({ message: "Payload is required" })
      .min(1, "Payload cannot be empty"),

    signature: z
      .string({ message: "Signature is required" })
      .min(1, "Signature cannot be empty"),

    gateway: z.enum(["easypaisa", "jazzcash", "mastercard"], {
      message: "Gateway must be one of: easypaisa, jazzcash, mastercard",
    }),
  }),
});

// GET PAYMENT STATS
export const GetPaymentStatsSchema = z.object({
  query: z.object({
    period: z
      .enum(["today", "week", "month", "year", "all"], {
        message: "Period must be one of: today, week, month, year, all",
      })
      .optional()
      .default("today"),

    groupBy: z
      .enum(["status", "method", "day", "hour"], {
        message: "Group by must be one of: status, method, day, hour",
      })
      .optional(),

    method: z
      .nativeEnum(PaymentMethodEnum, {
        message: `Method must be one of: ${Object.values(
          PaymentMethodEnum
        ).join(", ")}`,
      })
      .optional(),
  }),
});

// GET PAYMENTS BY DATE RANGE
export const GetPaymentsByDateRangeSchema = z.object({
  query: z
    .object({
      startDate: z
        .string({ message: "Start date is required" })
        .datetime("Invalid start date format. Use ISO 8601 format.")
        .transform((val) => new Date(val)),

      endDate: z
        .string({ message: "End date is required" })
        .datetime("Invalid end date format. Use ISO 8601 format.")
        .transform((val) => new Date(val)),

      method: z
        .nativeEnum(PaymentMethodEnum, {
          message: `Method must be one of: ${Object.values(
            PaymentMethodEnum
          ).join(", ")}`,
        })
        .optional(),

      status: z
        .nativeEnum(PaymentStatusEnum, {
          message: `Status must be one of: ${Object.values(
            PaymentStatusEnum
          ).join(", ")}`,
        })
        .optional(),
    })
    .refine((data) => data.startDate < data.endDate, {
      message: "Start date must be before end date",
      path: ["startDate"],
    }),
});

// RETRY FAILED PAYMENT
export const RetryFailedPaymentSchema = z.object({
  body: z.object({
    newMethod: z
      .nativeEnum(PaymentMethodEnum, {
        message: `Payment method must be one of: ${Object.values(
          PaymentMethodEnum
        ).join(", ")}`,
      })
      .optional()
      .describe("Change payment method for retry"),
  }),

  params: z.object({
    paymentId: z
      .string({ message: "Payment ID is required" })
      .uuid("Invalid payment ID format"),
  }),
});

// GET PENDING PAYMENTS (ADMIN DASHBOARD)
export const GetPendingPaymentsSchema = z.object({
  query: z.object({
    olderThan: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int("Minutes must be an integer")
          .min(1, "Minutes must be at least 1")
          .max(1440, "Minutes cannot exceed 1440 (24 hours)")
      )
      .optional()
      .describe("Filter payments pending for more than X minutes"),

    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int("Limit must be an integer")
          .min(1, "Limit must be at least 1")
          .max(100, "Limit cannot exceed 100")
      )
      .optional()
      .default("50" as any),
  }),
});

// CANCEL PAYMENT (BEFORE PROCESSING)
export const CancelPaymentSchema = z.object({
  body: z.object({
    cancellationReason: z
      .string({ message: "Cancellation reason is required" })
      .min(5, "Cancellation reason must be at least 5 characters")
      .max(500, "Cancellation reason cannot exceed 500 characters")
      .trim(),
  }),

  params: z.object({
    paymentId: z
      .string({ message: "Payment ID is required" })
      .uuid("Invalid payment ID format"),
  }),
});
