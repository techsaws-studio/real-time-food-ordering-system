import { z } from "zod";

import { MenuItemTagEnum } from "../enums/models-enums.js";

// CREATE MENU ITEM
export const CreateMenuItemSchema = z.object({
  body: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),

    name: z
      .string({ message: "Item name is required" })
      .min(2, "Item name must be at least 2 characters")
      .max(200, "Item name cannot exceed 200 characters")
      .trim(),

    description: z
      .string({ message: "Description is required" })
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description cannot exceed 1000 characters")
      .trim(),

    price: z
      .number({ message: "Price is required" })
      .positive("Price must be greater than 0")
      .max(999999.99, "Price cannot exceed 999,999.99")
      .multipleOf(0.01, "Price must have at most 2 decimal places"),

    images: z
      .array(z.string().url("Invalid image URL"))
      .max(5, "Cannot add more than 5 images")
      .optional()
      .default([]),

    preparationTime: z
      .number()
      .int("Preparation time must be an integer")
      .min(1, "Preparation time must be at least 1 minute")
      .max(180, "Preparation time cannot exceed 180 minutes")
      .optional()
      .default(15),

    tags: z
      .array(
        z.nativeEnum(MenuItemTagEnum, {
          message: `Tag must be one of: ${Object.values(MenuItemTagEnum).join(
            ", "
          )}`,
        })
      )
      .max(5, "Cannot add more than 5 tags")
      .optional()
      .default([]),

    displayOrder: z
      .number()
      .int("Display order must be an integer")
      .min(0, "Display order cannot be negative")
      .optional(),

    isAvailable: z.boolean().optional().default(true),
  }),
});

// GET MENU ITEM BY ID
export const GetMenuItemByIdSchema = z.object({
  params: z.object({
    itemId: z
      .string({ message: "Item ID is required" })
      .uuid("Invalid item ID format"),
  }),
});

// UPDATE MENU ITEM
export const UpdateMenuItemSchema = z.object({
  body: z
    .object({
      categoryId: z.string().uuid("Invalid category ID format").optional(),

      name: z
        .string()
        .min(2, "Item name must be at least 2 characters")
        .max(200, "Item name cannot exceed 200 characters")
        .trim()
        .optional(),

      description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(1000, "Description cannot exceed 1000 characters")
        .trim()
        .optional(),

      price: z
        .number()
        .positive("Price must be greater than 0")
        .max(999999.99, "Price cannot exceed 999,999.99")
        .multipleOf(0.01, "Price must have at most 2 decimal places")
        .optional(),

      images: z
        .array(z.string().url("Invalid image URL"))
        .max(5, "Cannot add more than 5 images")
        .optional(),

      preparationTime: z
        .number()
        .int("Preparation time must be an integer")
        .min(1, "Preparation time must be at least 1 minute")
        .max(180, "Preparation time cannot exceed 180 minutes")
        .optional(),

      tags: z
        .array(
          z.nativeEnum(MenuItemTagEnum, {
            message: `Tag must be one of: ${Object.values(MenuItemTagEnum).join(
              ", "
            )}`,
          })
        )
        .max(5, "Cannot add more than 5 tags")
        .optional(),

      displayOrder: z
        .number()
        .int("Display order must be an integer")
        .min(0, "Display order cannot be negative")
        .optional(),

      isAvailable: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),

  params: z.object({
    itemId: z
      .string({ message: "Item ID is required" })
      .uuid("Invalid item ID format"),
  }),
});

// DELETE MENU ITEM
export const DeleteMenuItemSchema = z.object({
  params: z.object({
    itemId: z
      .string({ message: "Item ID is required" })
      .uuid("Invalid item ID format"),
  }),
});

// GET MENU ITEMS BY CATEGORY
export const GetMenuItemsByCategorySchema = z.object({
  params: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),
  }),

  query: z.object({
    availableOnly: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional()
      .default(false as any),

    sortBy: z
      .enum(["displayOrder", "name", "price", "createdAt"], {
        message: "Sort by must be one of: displayOrder, name, price, createdAt",
      })
      .optional()
      .default("displayOrder"),

    order: z
      .enum(["asc", "desc"], {
        message: "Order must be one of: asc, desc",
      })
      .optional()
      .default("asc"),
  }),
});

// GET MENU ITEMS BY TAG
export const GetMenuItemsByTagSchema = z.object({
  params: z.object({
    tag: z.nativeEnum(MenuItemTagEnum, {
      message: `Tag must be one of: ${Object.values(MenuItemTagEnum).join(
        ", "
      )}`,
    }),
  }),

  query: z.object({
    availableOnly: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional()
      .default(true as any),
  }),
});

// GET MENU ITEMS BY PRICE RANGE
export const GetMenuItemsByPriceRangeSchema = z.object({
  query: z
    .object({
      minPrice: z
        .string({ message: "Minimum price is required" })
        .transform((val) => parseFloat(val))
        .pipe(
          z
            .number()
            .min(0, "Minimum price cannot be negative")
            .max(999999.99, "Minimum price cannot exceed 999,999.99")
        ),

      maxPrice: z
        .string({ message: "Maximum price is required" })
        .transform((val) => parseFloat(val))
        .pipe(
          z
            .number()
            .min(0, "Maximum price cannot be negative")
            .max(999999.99, "Maximum price cannot exceed 999,999.99")
        ),

      availableOnly: z
        .string()
        .transform((val) => val === "true")
        .pipe(z.boolean())
        .optional()
        .default(false as any),
    })
    .refine((data) => data.minPrice <= data.maxPrice, {
      message: "Minimum price must be less than or equal to maximum price",
      path: ["minPrice"],
    }),
});

// SEARCH MENU ITEMS
export const SearchMenuItemsSchema = z.object({
  query: z.object({
    searchTerm: z
      .string({ message: "Search term is required" })
      .min(1, "Search term cannot be empty")
      .max(100, "Search term cannot exceed 100 characters")
      .trim(),

    availableOnly: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional()
      .default(false as any),

    categoryId: z.string().uuid("Invalid category ID format").optional(),
  }),
});

// MARK AS 86 (UNAVAILABLE)
export const Mark86Schema = z.object({
  params: z.object({
    itemId: z
      .string({ message: "Item ID is required" })
      .uuid("Invalid item ID format"),
  }),

  body: z.object({
    reason: z
      .string()
      .min(5, "Reason must be at least 5 characters")
      .max(200, "Reason cannot exceed 200 characters")
      .trim()
      .optional(),
  }),
});

// UNMARK 86 (MAKE AVAILABLE)
export const Unmark86Schema = z.object({
  params: z.object({
    itemId: z
      .string({ message: "Item ID is required" })
      .uuid("Invalid item ID format"),
  }),
});

// BULK 86 ITEMS
export const Bulk86Schema = z.object({
  body: z.object({
    itemIds: z
      .array(z.string().uuid("Invalid item ID format"))
      .min(1, "At least one item ID must be provided")
      .max(100, "Cannot mark more than 100 items as 86 at once"),

    reason: z
      .string()
      .min(5, "Reason must be at least 5 characters")
      .max(200, "Reason cannot exceed 200 characters")
      .trim()
      .optional(),
  }),
});

// BULK UNMARK 86 ITEMS
export const BulkUnmark86Schema = z.object({
  body: z.object({
    itemIds: z
      .array(z.string().uuid("Invalid item ID format"))
      .min(1, "At least one item ID must be provided")
      .max(100, "Cannot unmark more than 100 items at once"),
  }),
});

// REORDER MENU ITEMS
export const ReorderMenuItemsSchema = z.object({
  body: z.object({
    itemOrders: z
      .array(
        z.object({
          itemId: z
            .string({ message: "Item ID is required" })
            .uuid("Invalid item ID format"),

          displayOrder: z
            .number({ message: "Display order is required" })
            .int("Display order must be an integer")
            .min(0, "Display order cannot be negative"),
        })
      )
      .min(1, "At least one item must be provided")
      .max(200, "Cannot reorder more than 200 items at once"),
  }),
});

// UPDATE MENU ITEM PRICE
export const UpdateMenuItemPriceSchema = z.object({
  body: z.object({
    price: z
      .number({ message: "Price is required" })
      .positive("Price must be greater than 0")
      .max(999999.99, "Price cannot exceed 999,999.99")
      .multipleOf(0.01, "Price must have at most 2 decimal places"),
  }),

  params: z.object({
    itemId: z
      .string({ message: "Item ID is required" })
      .uuid("Invalid item ID format"),
  }),
});

// BULK UPDATE PRICES (PERCENTAGE CHANGE)
export const BulkUpdatePricesSchema = z.object({
  body: z.object({
    itemIds: z
      .array(z.string().uuid("Invalid item ID format"))
      .min(1, "At least one item ID must be provided")
      .max(100, "Cannot update more than 100 items at once"),

    percentageChange: z
      .number({ message: "Percentage change is required" })
      .min(-100, "Percentage change cannot be less than -100%")
      .max(1000, "Percentage change cannot exceed 1000%")
      .multipleOf(0.01, "Percentage must have at most 2 decimal places"),
  }),
});

// DUPLICATE MENU ITEM
export const DuplicateMenuItemSchema = z.object({
  body: z.object({
    newName: z
      .string({ message: "New item name is required" })
      .min(2, "Item name must be at least 2 characters")
      .max(200, "Item name cannot exceed 200 characters")
      .trim(),

    newCategoryId: z.string().uuid("Invalid category ID format").optional(),

    copyImages: z.boolean().optional().default(true),
  }),

  params: z.object({
    itemId: z
      .string({ message: "Item ID is required" })
      .uuid("Invalid item ID format"),
  }),
});

// GET MENU ITEM STATS
export const GetMenuItemStatsSchema = z.object({
  params: z.object({
    itemId: z
      .string({ message: "Item ID is required" })
      .uuid("Invalid item ID format"),
  }),

  query: z.object({
    period: z
      .enum(["today", "week", "month", "year", "all"], {
        message: "Period must be one of: today, week, month, year, all",
      })
      .optional()
      .default("month"),
  }),
});
