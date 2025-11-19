import { z } from "zod";

import { OrderStatusEnum } from "../enums/models-enums.js";

// CREATE ORDER
export const CreateOrderSchema = z.object({
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

    items: z
      .array(
        z.object({
          itemId: z
            .string({ message: "Item ID is required" })
            .uuid("Invalid item ID format"),

          quantity: z
            .number({ message: "Quantity is required" })
            .int("Quantity must be an integer")
            .min(1, "Quantity must be at least 1")
            .max(99, "Quantity cannot exceed 99"),

          customizations: z
            .array(
              z
                .string()
                .min(1, "Customization cannot be empty")
                .max(100, "Customization cannot exceed 100 characters")
                .trim()
            )
            .max(10, "Cannot add more than 10 customizations per item")
            .optional()
            .default([]),
        })
      )
      .min(1, "Order must contain at least one item")
      .max(50, "Cannot order more than 50 items at once"),

    specialInstructions: z
      .string()
      .max(500, "Special instructions cannot exceed 500 characters")
      .trim()
      .optional(),
  }),
});

// GET ORDER BY ID
export const GetOrderByIdSchema = z.object({
  params: z.object({
    orderId: z
      .string({ message: "Order ID is required" })
      .uuid("Invalid order ID format"),
  }),
});

// GET ORDERS BY TABLE
export const GetOrdersByTableSchema = z.object({
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
      .nativeEnum(OrderStatusEnum, {
        message: `Status must be one of: ${Object.values(OrderStatusEnum).join(
          ", "
        )}`,
      })
      .optional(),

    activeOnly: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional()
      .default(false as any),
  }),
});

// GET ORDERS BY SESSION
export const GetOrdersBySessionSchema = z.object({
  params: z.object({
    sessionId: z
      .string({ message: "Session ID is required" })
      .uuid("Invalid session ID format"),
  }),

  query: z.object({
    status: z
      .nativeEnum(OrderStatusEnum, {
        message: `Status must be one of: ${Object.values(OrderStatusEnum).join(
          ", "
        )}`,
      })
      .optional(),
  }),
});

// GET ORDERS BY STATUS
export const GetOrdersByStatusSchema = z.object({
  params: z.object({
    status: z.nativeEnum(OrderStatusEnum, {
      message: `Status must be one of: ${Object.values(OrderStatusEnum).join(
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

// UPDATE ORDER STATUS
export const UpdateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatusEnum, {
      message: `Status must be one of: ${Object.values(OrderStatusEnum).join(
        ", "
      )}`,
    }),
  }),

  params: z.object({
    orderId: z
      .string({ message: "Order ID is required" })
      .uuid("Invalid order ID format"),
  }),
});

// ACCEPT ORDER (KITCHEN)
export const AcceptOrderSchema = z.object({
  body: z.object({
    acceptedBy: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),

    estimatedTime: z
      .number({ message: "Estimated time is required" })
      .int("Estimated time must be an integer")
      .min(1, "Estimated time must be at least 1 minute")
      .max(180, "Estimated time cannot exceed 180 minutes"),
  }),

  params: z.object({
    orderId: z
      .string({ message: "Order ID is required" })
      .uuid("Invalid order ID format"),
  }),
});

// REJECT ORDER (KITCHEN)
export const RejectOrderSchema = z.object({
  body: z.object({
    rejectedBy: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),

    rejectionReason: z
      .string({ message: "Rejection reason is required" })
      .min(5, "Rejection reason must be at least 5 characters")
      .max(500, "Rejection reason cannot exceed 500 characters")
      .trim(),
  }),

  params: z.object({
    orderId: z
      .string({ message: "Order ID is required" })
      .uuid("Invalid order ID format"),
  }),
});

// CANCEL ORDER
export const CancelOrderSchema = z.object({
  body: z.object({
    cancelledBy: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),

    cancellationReason: z
      .string({ message: "Cancellation reason is required" })
      .min(5, "Cancellation reason must be at least 5 characters")
      .max(500, "Cancellation reason cannot exceed 500 characters")
      .trim(),
  }),

  params: z.object({
    orderId: z
      .string({ message: "Order ID is required" })
      .uuid("Invalid order ID format"),
  }),
});

// MARK ORDER AS IN KITCHEN
export const MarkOrderInKitchenSchema = z.object({
  params: z.object({
    orderId: z
      .string({ message: "Order ID is required" })
      .uuid("Invalid order ID format"),
  }),
});

// MARK ORDER AS READY
export const MarkOrderReadySchema = z.object({
  params: z.object({
    orderId: z
      .string({ message: "Order ID is required" })
      .uuid("Invalid order ID format"),
  }),
});

// MARK ORDER AS SERVED
export const MarkOrderServedSchema = z.object({
  params: z.object({
    orderId: z
      .string({ message: "Order ID is required" })
      .uuid("Invalid order ID format"),
  }),
});

// GET ACTIVE ORDERS (KITCHEN DASHBOARD)
export const GetActiveOrdersSchema = z.object({
  query: z.object({
    tableId: z
      .string()
      .min(1, "Table ID cannot be empty")
      .max(20, "Table ID cannot exceed 20 characters")
      .trim()
      .toUpperCase()
      .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format")
      .optional(),

    sortBy: z
      .enum(["placedAt", "estimatedTime", "tableNumber"], {
        message: "Sort by must be one of: placedAt, estimatedTime, tableNumber",
      })
      .optional()
      .default("placedAt"),

    order: z
      .enum(["asc", "desc"], {
        message: "Order must be one of: asc, desc",
      })
      .optional()
      .default("asc"),
  }),
});

// GET KITCHEN ORDERS (ALL PROCESSING ORDERS)
export const GetKitchenOrdersSchema = z.object({
  query: z.object({
    includeReady: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional()
      .default(true as any),
  }),
});

// GET ORDERS BY DATE RANGE
export const GetOrdersByDateRangeSchema = z.object({
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
        .nativeEnum(OrderStatusEnum, {
          message: `Status must be one of: ${Object.values(
            OrderStatusEnum
          ).join(", ")}`,
        })
        .optional(),

      tableId: z
        .string()
        .min(1, "Table ID cannot be empty")
        .max(20, "Table ID cannot exceed 20 characters")
        .trim()
        .toUpperCase()
        .regex(/^TBL[A-Z0-9]{5}$/, "Invalid table ID format")
        .optional(),
    })
    .refine((data) => data.startDate < data.endDate, {
      message: "Start date must be before end date",
      path: ["startDate"],
    }),
});

// GET ORDER STATS
export const GetOrderStatsSchema = z.object({
  query: z.object({
    period: z
      .enum(["today", "week", "month", "year", "all"], {
        message: "Period must be one of: today, week, month, year, all",
      })
      .optional()
      .default("today"),

    groupBy: z
      .enum(["status", "table", "item", "hour", "day"], {
        message: "Group by must be one of: status, table, item, hour, day",
      })
      .optional(),
  }),
});

// BULK UPDATE ORDER STATUS
export const BulkUpdateOrderStatusSchema = z.object({
  body: z.object({
    orderIds: z
      .array(z.string().uuid("Invalid order ID format"))
      .min(1, "At least one order ID must be provided")
      .max(50, "Cannot update more than 50 orders at once"),

    status: z.nativeEnum(OrderStatusEnum, {
      message: `Status must be one of: ${Object.values(OrderStatusEnum).join(
        ", "
      )}`,
    }),

    updatedBy: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
  }),
});

// UPDATE ORDER ITEMS (ADD/REMOVE ITEMS - BEFORE ACCEPTED)
export const UpdateOrderItemsSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          itemId: z
            .string({ message: "Item ID is required" })
            .uuid("Invalid item ID format"),

          quantity: z
            .number({ message: "Quantity is required" })
            .int("Quantity must be an integer")
            .min(1, "Quantity must be at least 1")
            .max(99, "Quantity cannot exceed 99"),

          customizations: z
            .array(
              z
                .string()
                .min(1, "Customization cannot be empty")
                .max(100, "Customization cannot exceed 100 characters")
                .trim()
            )
            .max(10, "Cannot add more than 10 customizations per item")
            .optional()
            .default([]),
        })
      )
      .min(1, "Order must contain at least one item")
      .max(50, "Cannot have more than 50 items in an order"),
  }),

  params: z.object({
    orderId: z
      .string({ message: "Order ID is required" })
      .uuid("Invalid order ID format"),
  }),
});

// GET ORDER REVENUE STATS
export const GetOrderRevenueStatsSchema = z.object({
  query: z.object({
    startDate: z
      .string({ message: "Start date is required" })
      .datetime("Invalid start date format. Use ISO 8601 format.")
      .transform((val) => new Date(val)),

    endDate: z
      .string({ message: "End date is required" })
      .datetime("Invalid end date format. Use ISO 8601 format.")
      .transform((val) => new Date(val)),
  }),
});
