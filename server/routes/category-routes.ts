import { Router } from "express";

import {
  CreateCategory,
  GetAllCategories,
  GetActiveCategories,
  GetInactiveCategories,
  GetCategoryById,
  GetCategoryWithMenuItems,
  UpdateCategory,
  DeleteCategory,
  ReorderCategories,
  ActivateCategory,
  DeactivateCategory,
  ToggleCategoryStatus,
  GetCategoryStats,
  SearchCategories,
  BulkDeleteCategories,
  DuplicateCategory,
  MergeCategories,
} from "../controllers/category-controllers.js";

import { ValidateRequest } from "../middlewares/validation-middleware.js";
import { VerifyStaffAuth } from "../middlewares/auth-middleware.js";
import { RequireAdmin, RequireStaff } from "../middlewares/role-middleware.js";

import {
  CreateCategorySchema,
  GetCategoryByIdSchema,
  UpdateCategorySchema,
  DeleteCategorySchema,
  ReorderCategoriesSchema,
  ActivateCategorySchema,
  DeactivateCategorySchema,
  ToggleCategoryStatusSchema,
  GetActiveCategoriesSchema,
  GetInactiveCategoriesSchema,
  SearchCategoriesSchema,
  BulkDeleteCategoriesSchema,
  DuplicateCategorySchema,
  GetCategoryWithMenuItemsSchema,
  MergeCategoriesSchema,
} from "../validators/category-validators.js";

const CategoryRouter = Router();
CategoryRouter.use(VerifyStaffAuth);

// PUBLIC ROUTES
CategoryRouter.get(
  "/active",
  ValidateRequest(GetActiveCategoriesSchema),
  GetActiveCategories
);

// STAFF-PROTECTED ROUTES
CategoryRouter.get("/stats", RequireStaff, GetCategoryStats);
CategoryRouter.get(
  "/search",
  RequireStaff,
  ValidateRequest(SearchCategoriesSchema),
  SearchCategories
);
CategoryRouter.get(
  "/inactive",
  RequireStaff,
  ValidateRequest(GetInactiveCategoriesSchema),
  GetInactiveCategories
);
CategoryRouter.get("/", RequireStaff, GetAllCategories);
CategoryRouter.get(
  "/:categoryId/menu-items",
  RequireStaff,
  ValidateRequest(GetCategoryWithMenuItemsSchema),
  GetCategoryWithMenuItems
);
CategoryRouter.get(
  "/:categoryId",
  RequireStaff,
  ValidateRequest(GetCategoryByIdSchema),
  GetCategoryById
);

// ADMIN-ONLY ROUTES
CategoryRouter.put(
  "/reorder",
  RequireAdmin,
  ValidateRequest(ReorderCategoriesSchema),
  ReorderCategories
);
CategoryRouter.post(
  "/bulk-delete",
  RequireAdmin,
  ValidateRequest(BulkDeleteCategoriesSchema),
  BulkDeleteCategories
);
CategoryRouter.post(
  "/merge",
  RequireAdmin,
  ValidateRequest(MergeCategoriesSchema),
  MergeCategories
);
CategoryRouter.post(
  "/",
  RequireAdmin,
  ValidateRequest(CreateCategorySchema),
  CreateCategory
);
CategoryRouter.post(
  "/:categoryId/duplicate",
  RequireAdmin,
  ValidateRequest(DuplicateCategorySchema),
  DuplicateCategory
);
CategoryRouter.put(
  "/:categoryId/toggle-status",
  RequireAdmin,
  ValidateRequest(ToggleCategoryStatusSchema),
  ToggleCategoryStatus
);
CategoryRouter.put(
  "/:categoryId/activate",
  RequireAdmin,
  ValidateRequest(ActivateCategorySchema),
  ActivateCategory
);
CategoryRouter.put(
  "/:categoryId/deactivate",
  RequireAdmin,
  ValidateRequest(DeactivateCategorySchema),
  DeactivateCategory
);
CategoryRouter.put(
  "/:categoryId",
  RequireAdmin,
  ValidateRequest(UpdateCategorySchema),
  UpdateCategory
);
CategoryRouter.delete(
  "/:categoryId",
  RequireAdmin,
  ValidateRequest(DeleteCategorySchema),
  DeleteCategory
);

export default CategoryRouter;
