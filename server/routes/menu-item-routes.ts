import { Router } from "express";

import {
  CreateMenuItem,
  GetAllMenuItems,
  GetAvailableMenuItems,
  GetUnavailableMenuItems,
  GetMenuItemById,
  UpdateMenuItem,
  DeleteMenuItem,
  GetMenuItemsByCategory,
  GetMenuItemsByTag,
  GetMenuItemsByPriceRange,
  SearchMenuItems,
  Mark86,
  Unmark86,
  Bulk86,
  BulkUnmark86,
  UpdateMenuItemPrice,
  BulkUpdatePrices,
  ReorderMenuItems,
  GetMenuItemStats,
  DuplicateMenuItem,
  ToggleMenuItemAvailability,
  GetPopularItems,
  GetChefSpecials,
  GetNewItems,
} from "../controllers/menu-item-controllers.js";

import { ValidateRequest } from "../middlewares/validation-middleware.js";
import { VerifyStaffAuth } from "../middlewares/auth-middleware.js";
import {
  RequireAdmin,
  RequireStaff,
  RequireKitchenOrAdmin,
} from "../middlewares/role-middleware.js";

import {
  CreateMenuItemSchema,
  GetMenuItemByIdSchema,
  UpdateMenuItemSchema,
  DeleteMenuItemSchema,
  GetMenuItemsByCategorySchema,
  GetMenuItemsByTagSchema,
  GetMenuItemsByPriceRangeSchema,
  SearchMenuItemsSchema,
  Mark86Schema,
  Unmark86Schema,
  Bulk86Schema,
  BulkUnmark86Schema,
  UpdateMenuItemPriceSchema,
  BulkUpdatePricesSchema,
  ReorderMenuItemsSchema,
  DuplicateMenuItemSchema,
} from "../validators/menu-item-validators.js";

const MenuItemRouter = Router();
MenuItemRouter.use(VerifyStaffAuth);

// PUBLIC ROUTES
MenuItemRouter.get("/available", GetAvailableMenuItems);
MenuItemRouter.get("/popular", GetPopularItems);
MenuItemRouter.get("/chef-specials", GetChefSpecials);
MenuItemRouter.get("/new", GetNewItems);
MenuItemRouter.get(
  "/search",
  ValidateRequest(SearchMenuItemsSchema),
  SearchMenuItems
);
MenuItemRouter.get(
  "/price-range",
  ValidateRequest(GetMenuItemsByPriceRangeSchema),
  GetMenuItemsByPriceRange
);
MenuItemRouter.get(
  "/category/:categoryId",
  ValidateRequest(GetMenuItemsByCategorySchema),
  GetMenuItemsByCategory
);
MenuItemRouter.get(
  "/tag/:tag",
  ValidateRequest(GetMenuItemsByTagSchema),
  GetMenuItemsByTag
);

// STAFF-PROTECTED ROUTES
MenuItemRouter.get("/stats", RequireStaff, GetMenuItemStats);
MenuItemRouter.get("/unavailable", RequireStaff, GetUnavailableMenuItems);
MenuItemRouter.get(
  "/:itemId",
  RequireStaff,
  ValidateRequest(GetMenuItemByIdSchema),
  GetMenuItemById
);
MenuItemRouter.get("/", RequireStaff, GetAllMenuItems);
MenuItemRouter.post(
  "/bulk-86",
  RequireKitchenOrAdmin,
  ValidateRequest(Bulk86Schema),
  Bulk86
);
MenuItemRouter.post(
  "/bulk-unmark-86",
  RequireKitchenOrAdmin,
  ValidateRequest(BulkUnmark86Schema),
  BulkUnmark86
);
MenuItemRouter.put(
  "/:itemId/86",
  RequireKitchenOrAdmin,
  ValidateRequest(Mark86Schema),
  Mark86
);
MenuItemRouter.put(
  "/:itemId/unmark-86",
  RequireKitchenOrAdmin,
  ValidateRequest(Unmark86Schema),
  Unmark86
);
MenuItemRouter.put(
  "/:itemId/toggle-availability",
  RequireKitchenOrAdmin,
  ValidateRequest(GetMenuItemByIdSchema),
  ToggleMenuItemAvailability
);

// ADMIN-ONLY ROUTES
MenuItemRouter.put(
  "/reorder",
  RequireAdmin,
  ValidateRequest(ReorderMenuItemsSchema),
  ReorderMenuItems
);
MenuItemRouter.put(
  "/bulk-prices",
  RequireAdmin,
  ValidateRequest(BulkUpdatePricesSchema),
  BulkUpdatePrices
);
MenuItemRouter.post(
  "/",
  RequireAdmin,
  ValidateRequest(CreateMenuItemSchema),
  CreateMenuItem
);
MenuItemRouter.post(
  "/:itemId/duplicate",
  RequireAdmin,
  ValidateRequest(DuplicateMenuItemSchema),
  DuplicateMenuItem
);
MenuItemRouter.put(
  "/:itemId/price",
  RequireAdmin,
  ValidateRequest(UpdateMenuItemPriceSchema),
  UpdateMenuItemPrice
);
MenuItemRouter.put(
  "/:itemId",
  RequireAdmin,
  ValidateRequest(UpdateMenuItemSchema),
  UpdateMenuItem
);
MenuItemRouter.delete(
  "/:itemId",
  RequireAdmin,
  ValidateRequest(DeleteMenuItemSchema),
  DeleteMenuItem
);

export default MenuItemRouter;
