import { z } from "zod";

// ============================================================================
// CREATE CATEGORY
// ============================================================================

export const CreateCategorySchema = z.object({
  body: z.object({
    name: z
      .string({ message: "Category name is required" })
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name cannot exceed 100 characters")
      .trim(),

    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .trim()
      .optional(),

    displayOrder: z
      .number()
      .int("Display order must be an integer")
      .min(0, "Display order cannot be negative")
      .optional(),

    isActive: z.boolean().optional().default(true),
  }),
});

// ============================================================================
// GET CATEGORY BY ID
// ============================================================================

export const GetCategoryByIdSchema = z.object({
  params: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),
  }),
});

// ============================================================================
// UPDATE CATEGORY
// ============================================================================

export const UpdateCategorySchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "Category name must be at least 2 characters")
        .max(100, "Category name cannot exceed 100 characters")
        .trim()
        .optional(),

      description: z
        .string()
        .max(500, "Description cannot exceed 500 characters")
        .trim()
        .optional(),

      displayOrder: z
        .number()
        .int("Display order must be an integer")
        .min(0, "Display order cannot be negative")
        .optional(),

      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),

  params: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),
  }),
});

// ============================================================================
// DELETE CATEGORY
// ============================================================================

export const DeleteCategorySchema = z.object({
  params: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),
  }),
});

// ============================================================================
// REORDER CATEGORIES
// ============================================================================

export const ReorderCategoriesSchema = z.object({
  body: z.object({
    categoryOrders: z
      .array(
        z.object({
          categoryId: z
            .string({ message: "Category ID is required" })
            .uuid("Invalid category ID format"),

          displayOrder: z
            .number({ message: "Display order is required" })
            .int("Display order must be an integer")
            .min(0, "Display order cannot be negative"),
        })
      )
      .min(1, "At least one category must be provided")
      .max(100, "Cannot reorder more than 100 categories at once"),
  }),
});

// ============================================================================
// ACTIVATE CATEGORY
// ============================================================================

export const ActivateCategorySchema = z.object({
  params: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),
  }),
});

// ============================================================================
// DEACTIVATE CATEGORY
// ============================================================================

export const DeactivateCategorySchema = z.object({
  params: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),
  }),
});

// ============================================================================
// TOGGLE CATEGORY STATUS
// ============================================================================

export const ToggleCategoryStatusSchema = z.object({
  params: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),
  }),
});

// ============================================================================
// GET ACTIVE CATEGORIES
// ============================================================================

export const GetActiveCategoriesSchema = z.object({
  query: z.object({
    sortBy: z
      .enum(["displayOrder", "name", "createdAt"], {
        message: "Sort by must be one of: displayOrder, name, createdAt",
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

// ============================================================================
// GET INACTIVE CATEGORIES
// ============================================================================

export const GetInactiveCategoriesSchema = z.object({
  query: z.object({
    sortBy: z
      .enum(["displayOrder", "name", "createdAt"], {
        message: "Sort by must be one of: displayOrder, name, createdAt",
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

// ============================================================================
// SEARCH CATEGORIES
// ============================================================================

export const SearchCategoriesSchema = z.object({
  query: z.object({
    searchTerm: z
      .string({ message: "Search term is required" })
      .min(1, "Search term cannot be empty")
      .max(100, "Search term cannot exceed 100 characters")
      .trim(),

    includeInactive: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional()
      .default(false as any),
  }),
});

// ============================================================================
// BULK DELETE CATEGORIES
// ============================================================================

export const BulkDeleteCategoriesSchema = z.object({
  body: z.object({
    categoryIds: z
      .array(z.string().uuid("Invalid category ID format"))
      .min(1, "At least one category ID must be provided")
      .max(50, "Cannot delete more than 50 categories at once"),

    force: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Force delete even if categories have menu items (will reassign items)"
      ),
  }),
});

// ============================================================================
// DUPLICATE CATEGORY
// ============================================================================

export const DuplicateCategorySchema = z.object({
  body: z.object({
    newName: z
      .string({ message: "New category name is required" })
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name cannot exceed 100 characters")
      .trim(),

    copyMenuItems: z
      .boolean()
      .optional()
      .default(false)
      .describe("Also duplicate all menu items in this category"),
  }),

  params: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),
  }),
});

// ============================================================================
// GET CATEGORY WITH MENU ITEMS
// ============================================================================

export const GetCategoryWithMenuItemsSchema = z.object({
  params: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),
  }),

  query: z.object({
    includeInactive: z
      .string()
      .transform((val) => val === "true")
      .pipe(z.boolean())
      .optional()
      .default(false as any),

    sortBy: z
      .enum(["displayOrder", "name", "price"], {
        message: "Sort by must be one of: displayOrder, name, price",
      })
      .optional()
      .default("displayOrder"),
  }),
});

// ============================================================================
// GET CATEGORY STATS
// ============================================================================

export const GetCategoryStatsSchema = z.object({
  params: z.object({
    categoryId: z
      .string({ message: "Category ID is required" })
      .uuid("Invalid category ID format"),
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

// ============================================================================
// MERGE CATEGORIES
// ============================================================================

export const MergeCategoriesSchema = z.object({
  body: z.object({
    sourceCategoryIds: z
      .array(z.string().uuid("Invalid category ID format"))
      .min(1, "At least one source category must be provided")
      .max(10, "Cannot merge more than 10 categories at once"),

    targetCategoryId: z
      .string({ message: "Target category ID is required" })
      .uuid("Invalid category ID format"),

    deleteSourceCategories: z
      .boolean()
      .optional()
      .default(true)
      .describe("Delete source categories after merging"),
  }),
});
