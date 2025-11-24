import { z } from "zod";

// CREATE SESSION (QR CODE SCAN)
export const CreateSessionSchema = z.object({
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

    deviceId: z
      .string({ message: "Device ID is required" })
      .min(1, "Device ID cannot be empty")
      .max(255, "Device ID cannot exceed 255 characters")
      .trim(),
  }),
});

// VERIFY SESSION (2FA SECURITY CODE)
export const VerifySessionSchema = z.object({
  body: z.object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),

    securityCode: z
      .string({ message: "Security code is required" })
      .length(6, "Security code must be exactly 6 digits")
      .regex(/^\d{6}$/, "Security code must contain only digits"),
  }),
});

// GET SESSION BY ID
export const GetSessionByIdSchema = z.object({
  params: z.object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),
  }),
});

// END SESSION
export const EndSessionSchema = z.object({
  params: z.object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),
  }),
});

// GET ACTIVE SESSIONS BY TABLE
export const GetSessionsByTableSchema = z.object({
  params: z.object({
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
  }),
});

// GET SESSIONS BY DATE RANGE
export const GetSessionsByDateRangeSchema = z.object({
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

// EXTEND SESSION (OPTIONAL FEATURE)
export const ExtendSessionSchema = z.object({
  body: z.object({
    additionalHours: z
      .number({ message: "Additional hours must be a number" })
      .int("Additional hours must be an integer")
      .min(1, "Additional hours must be at least 1")
      .max(4, "Cannot extend session by more than 4 hours"),
  }),

  params: z.object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),
  }),
});

// REGENERATE SECURITY CODE (IF USER LOST IT)
export const RegenerateSecurityCodeSchema = z.object({
  params: z.object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),
  }),

  body: z.object({
    reason: z
      .string({ message: "Reason is required" })
      .min(5, "Reason must be at least 5 characters")
      .max(200, "Reason cannot exceed 200 characters")
      .trim()
      .optional(),
  }),
});

// VALIDATE SESSION (CHECK IF ACTIVE WITHOUT DB UPDATE)
export const ValidateSessionSchema = z.object({
  query: z.object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),
  }),
});

// GET SESSION STATS (ADMIN)
export const GetSessionStatsSchema = z.object({
  query: z.object({
    period: z
      .enum(["today", "week", "month", "year"], {
        message: "Period must be one of: today, week, month, year",
      })
      .optional()
      .default("today"),
  }),
});

// CLEANUP EXPIRED SESSIONS (ADMIN/CRON)
export const CleanupExpiredSessionsSchema = z.object({
  query: z.object({
    dryRun: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional()
      .default(false as any),
  }),
});

// FORCE END SESSION (ADMIN/RECEPTIONIST)
export const ForceEndSessionSchema = z.object({
  body: z.object({
    reason: z
      .string({ message: "Reason is required" })
      .min(5, "Reason must be at least 5 characters")
      .max(500, "Reason cannot exceed 500 characters")
      .trim(),
  }),

  params: z.object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),
  }),
});

// GET ACTIVE SESSIONS COUNT (DASHBOARD)
export const GetActiveSessionsCountSchema = z.object({
  query: z.object({
    tableId: z
      .string()
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format")
      .optional(),
  }),
});

// TRANSFER SESSION TO DIFFERENT TABLE (ADMIN)
export const TransferSessionSchema = z.object({
  body: z.object({
    newTableId: z
      .string({ message: "New table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(
        /^TBL[A-Z0-9]{5}$/,
        "Table ID must match format: TBL + 5 alphanumeric characters"
      ),

    reason: z
      .string({ message: "Reason is required" })
      .min(5, "Reason must be at least 5 characters")
      .max(200, "Reason cannot exceed 200 characters")
      .trim(),
  }),

  params: z.object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),
  }),
});
