import { z } from "zod";

import { TableStatusEnum } from "../enums/models-enums.js";

// CREATE TABLE
export const CreateTableSchema = z.object({
  body: z.object({
    tableNumber: z
      .number({ message: "Table number is required" })
      .int("Table number must be an integer")
      .min(1, "Table number must be at least 1")
      .max(100, "Table number cannot exceed 100"),

    capacity: z
      .number({ message: "Capacity is required" })
      .int("Capacity must be an integer")
      .min(1, "Capacity must be at least 1")
      .max(20, "Capacity cannot exceed 20")
      .default(4),

    location: z
      .string()
      .min(2, "Location must be at least 2 characters")
      .max(100, "Location cannot exceed 100 characters")
      .trim()
      .optional(),

    status: z
      .nativeEnum(TableStatusEnum, {
        message: `Status must be one of: ${Object.values(TableStatusEnum).join(
          ", "
        )}`,
      })
      .optional()
      .default(TableStatusEnum.AVAILABLE),
  }),
});

// CREATE MULTIPLE TABLES (BULK)
export const CreateMultipleTablesSchema = z.object({
  body: z.object({
    tables: z
      .array(
        z.object({
          tableNumber: z
            .number({ message: "Table number is required" })
            .int("Table number must be an integer")
            .min(1, "Table number must be at least 1")
            .max(100, "Table number cannot exceed 100"),

          capacity: z
            .number({ message: "Capacity is required" })
            .int("Capacity must be an integer")
            .min(1, "Capacity must be at least 1")
            .max(20, "Capacity cannot exceed 20")
            .default(4),

          location: z
            .string()
            .min(2, "Location must be at least 2 characters")
            .max(100, "Location cannot exceed 100 characters")
            .trim()
            .optional(),
        })
      )
      .min(1, "At least one table must be provided")
      .max(50, "Cannot create more than 50 tables at once"),
  }),
});

// GET TABLE BY ID
export const GetTableByIdSchema = z.object({
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

// GET TABLE BY NUMBER
export const GetTableByNumberSchema = z.object({
  params: z.object({
    tableNumber: z
      .string({ message: "Table number is required" })
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int("Table number must be an integer")
          .min(1, "Table number must be at least 1")
          .max(100, "Table number cannot exceed 100")
      ),
  }),
});

// UPDATE TABLE
export const UpdateTableSchema = z.object({
  body: z
    .object({
      capacity: z
        .number()
        .int("Capacity must be an integer")
        .min(1, "Capacity must be at least 1")
        .max(20, "Capacity cannot exceed 20")
        .optional(),

      location: z
        .string()
        .min(2, "Location must be at least 2 characters")
        .max(100, "Location cannot exceed 100 characters")
        .trim()
        .optional(),

      status: z
        .nativeEnum(TableStatusEnum, {
          message: `Status must be one of: ${Object.values(
            TableStatusEnum
          ).join(", ")}`,
        })
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),

  params: z.object({
    tableId: z
      .string({ message: "Table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format"),
  }),
});

// UPDATE TABLE STATUS
export const UpdateTableStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(TableStatusEnum, {
      message: `Status must be one of: ${Object.values(TableStatusEnum).join(
        ", "
      )}`,
    }),
  }),

  params: z.object({
    tableId: z
      .string({ message: "Table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format"),
  }),
});

// MARK TABLE AS OCCUPIED
export const MarkTableAsOccupiedSchema = z.object({
  params: z.object({
    tableId: z
      .string({ message: "Table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format"),
  }),
});

// MARK TABLE AS AVAILABLE
export const MarkTableAsAvailableSchema = z.object({
  params: z.object({
    tableId: z
      .string({ message: "Table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format"),
  }),
});

// MARK TABLE AS RESERVED
export const MarkTableAsReservedSchema = z.object({
  params: z.object({
    tableId: z
      .string({ message: "Table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format"),
  }),
});

// MARK TABLE AS MAINTENANCE
export const MarkTableAsMaintenanceSchema = z.object({
  params: z.object({
    tableId: z
      .string({ message: "Table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format"),
  }),
});

// DELETE TABLE
export const DeleteTableSchema = z.object({
  params: z.object({
    tableId: z
      .string({ message: "Table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format"),
  }),
});

// GET TABLES BY STATUS
export const GetTablesByStatusSchema = z.object({
  params: z.object({
    status: z.nativeEnum(TableStatusEnum, {
      message: `Status must be one of: ${Object.values(TableStatusEnum).join(
        ", "
      )}`,
    }),
  }),
});

// GET TABLES BY CAPACITY
export const GetTablesByCapacitySchema = z.object({
  query: z.object({
    minCapacity: z
      .string({ message: "Minimum capacity is required" })
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int("Minimum capacity must be an integer")
          .min(1, "Minimum capacity must be at least 1")
          .max(20, "Minimum capacity cannot exceed 20")
      ),
  }),
});

// GET TABLES BY LOCATION
export const GetTablesByLocationSchema = z.object({
  query: z.object({
    location: z
      .string({ message: "Location is required" })
      .min(1, "Location cannot be empty")
      .max(100, "Location cannot exceed 100 characters")
      .trim(),
  }),
});

// BULK UPDATE TABLE STATUS
export const BulkUpdateTableStatusSchema = z.object({
  body: z.object({
    tableIds: z
      .array(
        z
          .string()
          .min(1, "Table ID cannot be empty")
          .max(20, "Table ID cannot exceed 20 characters")
          .trim()
          .toUpperCase()
          .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format")
      )
      .min(1, "At least one table ID must be provided")
      .max(50, "Cannot update more than 50 tables at once"),

    status: z.nativeEnum(TableStatusEnum, {
      message: `Status must be one of: ${Object.values(TableStatusEnum).join(
        ", "
      )}`,
    }),
  }),
});

// REGENERATE QR CODE
export const RegenerateQRCodeSchema = z.object({
  params: z.object({
    tableId: z
      .string({ message: "Table ID is required" })
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format"),
  }),
});

// GET TABLE STATS (ADMIN DASHBOARD)
export const GetTableStatsSchema = z.object({
  query: z.object({
    includeHistory: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional()
      .default(false as any),
  }),
});
