import { z } from "zod";

import { BillStatusEnum } from "../enums/models-enums.js";

// ============================================================================
// CREATE OR GET BILL
// ============================================================================

export const CreateOrGetBillSchema = z.object({
  body: z.object({
    tableId: z
      .string({ message: "Table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(
        /^TBL[A-Z0-9]{5}$/,
        "Table ID must match format: TBL + 5 alphanumeric characters"
      ),

    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),
  }),
});

// ============================================================================
// GET BILL BY ID
// ============================================================================

export const GetBillByIdSchema = z.object({
  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// GET CURRENT BILL BY SESSION
// ============================================================================

export const GetCurrentBillBySessionSchema = z.object({
  params: z.object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),
  }),
});

// ============================================================================
// GET BILLS BY TABLE
// ============================================================================

export const GetBillsByTableSchema = z.object({
  params: z.object({
    tableId: z
      .string({ message: "Table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format"),
  }),

  query: z.object({
    status: z
      .nativeEnum(BillStatusEnum, {
        message: `Status must be one of: ${Object.values(BillStatusEnum).join(
          ", "
        )}`,
      })
      .optional(),

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
      .optional(),
  }),
});

// ============================================================================
// GET BILLS BY STATUS
// ============================================================================

export const GetBillsByStatusSchema = z.object({
  params: z.object({
    status: z.nativeEnum(BillStatusEnum, {
      message: `Status must be one of: ${Object.values(BillStatusEnum).join(
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

// ============================================================================
// ADD ORDER TO BILL
// ============================================================================

export const AddOrderToBillSchema = z.object({
  body: z.object({
    orderId: z
      .string({ message: "Order ID is required" })
      .uuid("Invalid order ID format"),
  }),

  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// APPLY PROMO CODE
// ============================================================================

export const ApplyPromoCodeSchema = z.object({
  body: z.object({
    promoCode: z
      .string({ message: "Promo code is required" })
      .min(3, "Promo code must be at least 3 characters")
      .max(20, "Promo code cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z0-9]+$/,
        "Promo code must contain only uppercase letters and numbers"
      ),
  }),

  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// REMOVE PROMO CODE
// ============================================================================

export const RemovePromoCodeSchema = z.object({
  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// MARK BILL AS PENDING PAYMENT
// ============================================================================

export const MarkBillPendingPaymentSchema = z.object({
  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// MARK BILL AS PAID
// ============================================================================

export const MarkBillPaidSchema = z.object({
  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// CLOSE BILL
// ============================================================================

export const CloseBillSchema = z.object({
  body: z.object({
    closedBy: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
  }),

  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// VOID BILL
// ============================================================================

export const VoidBillSchema = z.object({
  body: z.object({
    voidedBy: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),

    voidReason: z
      .string({ message: "Void reason is required" })
      .min(5, "Void reason must be at least 5 characters")
      .max(500, "Void reason cannot exceed 500 characters")
      .trim(),
  }),

  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// UPDATE BILL CHARGES (ADMIN - MANUAL ADJUSTMENTS)
// ============================================================================

export const UpdateBillChargesSchema = z.object({
  body: z
    .object({
      taxRate: z
        .number()
        .min(0, "Tax rate cannot be negative")
        .max(100, "Tax rate cannot exceed 100%")
        .multipleOf(0.01, "Tax rate must have at most 2 decimal places")
        .optional(),

      serviceChargeRate: z
        .number()
        .min(0, "Service charge rate cannot be negative")
        .max(100, "Service charge rate cannot exceed 100%")
        .multipleOf(
          0.01,
          "Service charge rate must have at most 2 decimal places"
        )
        .optional(),

      discountRate: z
        .number()
        .min(0, "Discount rate cannot be negative")
        .max(100, "Discount rate cannot exceed 100%")
        .multipleOf(0.01, "Discount rate must have at most 2 decimal places")
        .optional(),

      manualDiscount: z
        .number()
        .min(0, "Manual discount cannot be negative")
        .multipleOf(0.01, "Manual discount must have at most 2 decimal places")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one charge field must be provided",
    }),

  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// GET BILL STATS
// ============================================================================

export const GetBillStatsSchema = z.object({
  query: z.object({
    period: z
      .enum(["today", "week", "month", "year", "all"], {
        message: "Period must be one of: today, week, month, year, all",
      })
      .optional()
      .default("today"),

    groupBy: z
      .enum(["status", "table", "day", "hour"], {
        message: "Group by must be one of: status, table, day, hour",
      })
      .optional(),
  }),
});

// ============================================================================
// GET BILLS BY DATE RANGE
// ============================================================================

export const GetBillsByDateRangeSchema = z.object({
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

      status: z
        .nativeEnum(BillStatusEnum, {
          message: `Status must be one of: ${Object.values(BillStatusEnum).join(
            ", "
          )}`,
        })
        .optional(),

      minAmount: z
        .string()
        .transform((val) => parseFloat(val))
        .pipe(z.number().min(0, "Minimum amount cannot be negative"))
        .optional(),

      maxAmount: z
        .string()
        .transform((val) => parseFloat(val))
        .pipe(z.number().min(0, "Maximum amount cannot be negative"))
        .optional(),
    })
    .refine((data) => data.startDate < data.endDate, {
      message: "Start date must be before end date",
      path: ["startDate"],
    })
    .refine(
      (data) =>
        !data.minAmount || !data.maxAmount || data.minAmount <= data.maxAmount,
      {
        message: "Minimum amount must be less than or equal to maximum amount",
        path: ["minAmount"],
      }
    ),
});

// ============================================================================
// GET REVENUE BY DATE RANGE
// ============================================================================

export const GetRevenueByDateRangeSchema = z.object({
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
    })
    .refine((data) => data.startDate < data.endDate, {
      message: "Start date must be before end date",
      path: ["startDate"],
    }),
});

// ============================================================================
// GET AVERAGE BILL VALUE
// ============================================================================

export const GetAverageBillValueSchema = z.object({
  query: z.object({
    period: z
      .enum(["today", "week", "month", "year", "all"], {
        message: "Period must be one of: today, week, month, year, all",
      })
      .optional()
      .default("month"),
  }),
});

// ============================================================================
// SPLIT BILL (FUTURE FEATURE)
// ============================================================================

export const SplitBillSchema = z.object({
  body: z.object({
    numberOfSplits: z
      .number({ message: "Number of splits is required" })
      .int("Number of splits must be an integer")
      .min(2, "Must split into at least 2 bills")
      .max(10, "Cannot split into more than 10 bills"),

    splitType: z.enum(["equal", "custom"], {
      message: "Split type must be either 'equal' or 'custom'",
    }),

    customSplits: z
      .array(
        z.object({
          orderIds: z
            .array(z.string().uuid("Invalid order ID format"))
            .min(1, "Each split must have at least one order"),

          percentage: z
            .number()
            .min(0, "Percentage cannot be negative")
            .max(100, "Percentage cannot exceed 100")
            .optional(),
        })
      )
      .optional(),
  }),

  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// RECALCULATE BILL (ADMIN - FORCE RECALCULATION)
// ============================================================================

export const RecalculateBillSchema = z.object({
  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});

// ============================================================================
// EMAIL BILL (SEND RECEIPT)
// ============================================================================

export const EmailBillSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email format")
      .trim()
      .toLowerCase(),

    includeDetails: z.boolean().optional().default(true),
  }),

  params: z.object({
    billId: z
      .string({ message: "Bill ID is required" })
      .uuid("Invalid bill ID format"),
  }),
});
