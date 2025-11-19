import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import { MenuItemTagEnum } from "../enums/models-enums.js";

import { menuItemService } from "../services/menu-item-service.js";
import { categoryService } from "../services/category-service.js";

import { menuItemRepository } from "../repositories/menu-item-repository.js";

import { ApiResponse } from "../utils/api-response-formatter.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { ErrorHandler } from "../utils/error-handler.js";

export const CreateMenuItem = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      categoryId,
      name,
      description,
      price,
      images,
      preparationTime,
      tags,
      displayOrder,
    } = req.body;

    const menuItem = await menuItemService.createMenuItem({
      categoryId,
      name,
      description,
      price,
      images,
      preparationTime,
      tags,
      displayOrder,
    });

    return ApiResponse.created(
      res,
      {
        itemId: menuItem.itemId,
        categoryId: menuItem.categoryId,
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        images: menuItem.images,
        isAvailable: menuItem.isAvailable,
        preparationTime: menuItem.preparationTime,
        tags: menuItem.tags,
        displayOrder: menuItem.displayOrder,
        createdAt: menuItem.createdAt,
      },
      "Menu item created successfully"
    );
  }
);

export const GetAllMenuItems = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const menuItems = await menuItemService.getAllMenuItems();

    return ApiResponse.success(
      res,
      menuItems.map((item) => ({
        itemId: item.itemId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        images: item.images,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime,
        tags: item.tags,
        displayOrder: item.displayOrder,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      `Retrieved ${menuItems.length} menu item(s) successfully`
    );
  }
);

export const GetAvailableMenuItems = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const menuItems = await menuItemService.getAvailableMenuItems();

    return ApiResponse.success(
      res,
      menuItems.map((item) => ({
        itemId: item.itemId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        images: item.images,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime,
        tags: item.tags,
        displayOrder: item.displayOrder,
      })),
      `Retrieved ${menuItems.length} available menu item(s) successfully`
    );
  }
);

export const GetUnavailableMenuItems = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const menuItems = await menuItemRepository.findUnavailable();

    return ApiResponse.success(
      res,
      menuItems.map((item) => ({
        itemId: item.itemId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime,
      })),
      `Retrieved ${menuItems.length} unavailable (86'd) menu item(s)`
    );
  }
);

export const GetMenuItemById = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId } = req.params;

    const menuItem = await menuItemService.getMenuItemById(itemId);

    const category = await categoryService.getCategoryById(menuItem.categoryId);

    return ApiResponse.success(
      res,
      {
        itemId: menuItem.itemId,
        categoryId: menuItem.categoryId,
        categoryName: category.name,
        name: menuItem.name,
        description: menuItem.description,
        price: menuItem.price,
        images: menuItem.images,
        isAvailable: menuItem.isAvailable,
        preparationTime: menuItem.preparationTime,
        tags: menuItem.tags,
        displayOrder: menuItem.displayOrder,
        createdAt: menuItem.createdAt,
        updatedAt: menuItem.updatedAt,
      },
      "Menu item retrieved successfully"
    );
  }
);

export const UpdateMenuItem = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const updates = req.body;

    const updatedItem = await menuItemService.updateMenuItem(itemId, updates);

    return ApiResponse.success(
      res,
      {
        itemId: updatedItem.itemId,
        categoryId: updatedItem.categoryId,
        name: updatedItem.name,
        description: updatedItem.description,
        price: updatedItem.price,
        images: updatedItem.images,
        isAvailable: updatedItem.isAvailable,
        preparationTime: updatedItem.preparationTime,
        tags: updatedItem.tags,
        displayOrder: updatedItem.displayOrder,
        updatedAt: updatedItem.updatedAt,
      },
      "Menu item updated successfully"
    );
  }
);

export const DeleteMenuItem = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId } = req.params;

    const menuItem = await menuItemService.getMenuItemById(itemId);

    await menuItemService.deleteMenuItem(itemId);

    return ApiResponse.success(
      res,
      {
        deleted: true,
        itemId,
        name: menuItem.name,
      },
      "Menu item deleted successfully"
    );
  }
);

export const GetMenuItemsByCategory = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const { availableOnly } = req.query;

    const category = await categoryService.getCategoryById(categoryId);

    let menuItems;
    if (availableOnly === "true") {
      menuItems = await menuItemService.getAvailableMenuItemsByCategory(
        categoryId
      );
    } else {
      menuItems = await menuItemService.getMenuItemsByCategory(categoryId);
    }

    return ApiResponse.success(
      res,
      {
        categoryId: category.categoryId,
        categoryName: category.name,
        itemsCount: menuItems.length,
        items: menuItems.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          price: item.price,
          images: item.images,
          isAvailable: item.isAvailable,
          preparationTime: item.preparationTime,
          tags: item.tags,
          displayOrder: item.displayOrder,
        })),
      },
      `Retrieved ${menuItems.length} menu item(s) for category '${category.name}'`
    );
  }
);

export const GetMenuItemsByTag = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tag } = req.params;

    const menuItems = await menuItemService.getMenuItemsByTag(
      tag as MenuItemTagEnum
    );

    return ApiResponse.success(
      res,
      menuItems.map((item) => ({
        itemId: item.itemId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        images: item.images,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime,
        tags: item.tags,
        displayOrder: item.displayOrder,
      })),
      `Retrieved ${menuItems.length} menu item(s) with tag '${tag}'`
    );
  }
);

export const GetMenuItemsByPriceRange = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { minPrice, maxPrice } = req.query;

    const min = parseFloat(minPrice as string);
    const max = parseFloat(maxPrice as string);

    const menuItems = await menuItemRepository.findByPriceRange(min, max);

    return ApiResponse.success(
      res,
      {
        priceRange: {
          min,
          max,
        },
        itemsCount: menuItems.length,
        items: menuItems.map((item) => ({
          itemId: item.itemId,
          categoryId: item.categoryId,
          name: item.name,
          description: item.description,
          price: item.price,
          isAvailable: item.isAvailable,
          preparationTime: item.preparationTime,
          tags: item.tags,
        })),
      },
      `Retrieved ${menuItems.length} menu item(s) in price range PKR ${min} - ${max}`
    );
  }
);

export const SearchMenuItems = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { searchTerm, categoryId, availableOnly } = req.query;

    if (!searchTerm || typeof searchTerm !== "string") {
      throw new ErrorHandler("Search term is required", 400);
    }

    let menuItems = await menuItemService.searchMenuItems(searchTerm);

    if (categoryId && typeof categoryId === "string") {
      menuItems = menuItems.filter((item) => item.categoryId === categoryId);
    }

    if (availableOnly === "true") {
      menuItems = menuItems.filter((item) => item.isAvailable);
    }

    return ApiResponse.success(
      res,
      menuItems.map((item) => ({
        itemId: item.itemId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        images: item.images,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime,
        tags: item.tags,
      })),
      `Found ${menuItems.length} menu item(s) matching '${searchTerm}'`
    );
  }
);

export const Mark86 = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const { reason } = req.body;

    const menuItem = await menuItemService.getMenuItemById(itemId);

    if (!menuItem.isAvailable) {
      throw new ErrorHandler("Menu item is already marked as 86", 400);
    }

    const updatedItem = await menuItemService.mark86(itemId);

    console.log(
      `Menu item ${itemId} (${menuItem.name}) marked as 86 by ${
        req.user?.userId
      }. Reason: ${reason || "Not provided"}`
    );

    return ApiResponse.success(
      res,
      {
        itemId: updatedItem.itemId,
        name: updatedItem.name,
        isAvailable: updatedItem.isAvailable,
        markedBy: req.user?.userId,
        reason: reason || null,
      },
      `'${updatedItem.name}' marked as 86 (unavailable)`
    );
  }
);

export const Unmark86 = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId } = req.params;

    const menuItem = await menuItemService.getMenuItemById(itemId);

    if (menuItem.isAvailable) {
      throw new ErrorHandler("Menu item is already available", 400);
    }

    const updatedItem = await menuItemService.unmark86(itemId);

    return ApiResponse.success(
      res,
      {
        itemId: updatedItem.itemId,
        name: updatedItem.name,
        isAvailable: updatedItem.isAvailable,
        unmarkedBy: req.user?.userId,
      },
      `'${updatedItem.name}' is now available`
    );
  }
);

export const Bulk86 = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemIds, reason } = req.body;

    const updatedCount = await menuItemService.bulk86(itemIds);

    console.log(
      `Bulk 86: ${updatedCount} items marked as unavailable by ${
        req.user?.userId
      }. Reason: ${reason || "Not provided"}`
    );

    return ApiResponse.success(
      res,
      {
        requested: itemIds.length,
        updated: updatedCount,
        failed: itemIds.length - updatedCount,
        markedBy: req.user?.userId,
        reason: reason || null,
      },
      `Successfully marked ${updatedCount} item(s) as 86`
    );
  }
);

export const BulkUnmark86 = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemIds } = req.body;

    const updatedCount = await menuItemService.bulkUnmark86(itemIds);

    return ApiResponse.success(
      res,
      {
        requested: itemIds.length,
        updated: updatedCount,
        failed: itemIds.length - updatedCount,
        unmarkedBy: req.user?.userId,
      },
      `Successfully marked ${updatedCount} item(s) as available`
    );
  }
);

export const UpdateMenuItemPrice = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const { price } = req.body;

    const menuItem = await menuItemService.getMenuItemById(itemId);
    const oldPrice = menuItem.price;

    const updatedItem = await menuItemService.updateMenuItem(itemId, { price });

    return ApiResponse.success(
      res,
      {
        itemId: updatedItem.itemId,
        name: updatedItem.name,
        oldPrice,
        newPrice: updatedItem.price,
        priceChange: updatedItem.price - oldPrice,
        percentageChange:
          oldPrice > 0
            ? Math.round(
                ((updatedItem.price - oldPrice) / oldPrice) * 100 * 100
              ) / 100
            : 0,
        updatedBy: req.user?.userId,
      },
      `Price updated from PKR ${oldPrice} to PKR ${updatedItem.price}`
    );
  }
);

export const BulkUpdatePrices = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemIds, percentageChange } = req.body;

    const updated: { itemId: string; oldPrice: number; newPrice: number }[] =
      [];
    const failed: { itemId: string; reason: string }[] = [];

    for (const itemId of itemIds) {
      try {
        const menuItem = await menuItemService.getMenuItemById(itemId);
        const oldPrice = menuItem.price;
        const newPrice =
          Math.round(oldPrice * (1 + percentageChange / 100) * 100) / 100;

        if (newPrice <= 0) {
          failed.push({
            itemId,
            reason: "New price would be zero or negative",
          });
          continue;
        }

        await menuItemService.updateMenuItem(itemId, { price: newPrice });
        updated.push({ itemId, oldPrice, newPrice });
      } catch (error) {
        failed.push({
          itemId,
          reason: (error as Error).message,
        });
      }
    }

    return ApiResponse.success(
      res,
      {
        requested: itemIds.length,
        updated: updated.length,
        failed: failed.length,
        percentageChange,
        updates: updated,
        failures: failed,
        updatedBy: req.user?.userId,
      },
      `Successfully updated prices for ${updated.length} item(s) by ${percentageChange}%`
    );
  }
);

export const ReorderMenuItems = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemOrders } = req.body;

    await menuItemService.reorderMenuItems(itemOrders);

    return ApiResponse.success(
      res,
      {
        reordered: itemOrders.length,
      },
      `Successfully reordered ${itemOrders.length} menu item(s)`
    );
  }
);

export const GetMenuItemStats = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await menuItemService.getMenuItemStats();

    const allItems = await menuItemRepository.findAll();
    const prices = allItems.map((item) => item.price);
    const avgPrice =
      prices.length > 0
        ? prices.reduce((sum, p) => sum + p, 0) / prices.length
        : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    return ApiResponse.success(
      res,
      {
        total: stats.total,
        available: stats.available,
        unavailable: stats.unavailable,
        percentages: {
          availablePercentage:
            stats.total > 0
              ? Math.round((stats.available / stats.total) * 100)
              : 0,
          unavailablePercentage:
            stats.total > 0
              ? Math.round((stats.unavailable / stats.total) * 100)
              : 0,
        },
        priceStats: {
          average: Math.round(avgPrice * 100) / 100,
          minimum: minPrice,
          maximum: maxPrice,
        },
        byCategory: stats.byCategory,
      },
      "Menu item statistics retrieved successfully"
    );
  }
);

export const DuplicateMenuItem = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId } = req.params;
    const { newName, newCategoryId, copyImages } = req.body;

    const originalItem = await menuItemService.getMenuItemById(itemId);

    const newItem = await menuItemService.createMenuItem({
      categoryId: newCategoryId || originalItem.categoryId,
      name: newName,
      description: originalItem.description,
      price: originalItem.price,
      images: copyImages !== false ? originalItem.images : [],
      preparationTime: originalItem.preparationTime,
      tags: originalItem.tags,
      displayOrder: originalItem.displayOrder + 1,
    });

    return ApiResponse.created(
      res,
      {
        itemId: newItem.itemId,
        categoryId: newItem.categoryId,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        images: newItem.images,
        isAvailable: newItem.isAvailable,
        preparationTime: newItem.preparationTime,
        tags: newItem.tags,
        displayOrder: newItem.displayOrder,
        copiedFrom: originalItem.itemId,
      },
      "Menu item duplicated successfully"
    );
  }
);

export const ToggleMenuItemAvailability = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { itemId } = req.params;

    const menuItem = await menuItemService.getMenuItemById(itemId);

    let updatedItem;
    if (menuItem.isAvailable) {
      updatedItem = await menuItemService.mark86(itemId);
    } else {
      updatedItem = await menuItemService.unmark86(itemId);
    }

    return ApiResponse.success(
      res,
      {
        itemId: updatedItem.itemId,
        name: updatedItem.name,
        isAvailable: updatedItem.isAvailable,
        statusChanged: menuItem.isAvailable ? "marked as 86" : "now available",
      },
      `'${updatedItem.name}' ${
        updatedItem.isAvailable ? "is now available" : "marked as 86"
      }`
    );
  }
);

export const GetPopularItems = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const menuItems = await menuItemRepository.findByTag(
      MenuItemTagEnum.POPULAR
    );

    const availableItems = menuItems.filter((item) => item.isAvailable);

    return ApiResponse.success(
      res,
      availableItems.map((item) => ({
        itemId: item.itemId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        images: item.images,
        preparationTime: item.preparationTime,
        tags: item.tags,
      })),
      `Retrieved ${availableItems.length} popular menu item(s)`
    );
  }
);

export const GetChefSpecials = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const menuItems = await menuItemRepository.findByTag(
      MenuItemTagEnum.CHEF_SPECIAL
    );

    const availableItems = menuItems.filter((item) => item.isAvailable);

    return ApiResponse.success(
      res,
      availableItems.map((item) => ({
        itemId: item.itemId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        images: item.images,
        preparationTime: item.preparationTime,
        tags: item.tags,
      })),
      `Retrieved ${availableItems.length} chef special(s)`
    );
  }
);

export const GetNewItems = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const menuItems = await menuItemRepository.findByTag(MenuItemTagEnum.NEW);

    const availableItems = menuItems.filter((item) => item.isAvailable);

    return ApiResponse.success(
      res,
      availableItems.map((item) => ({
        itemId: item.itemId,
        categoryId: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        images: item.images,
        preparationTime: item.preparationTime,
        tags: item.tags,
      })),
      `Retrieved ${availableItems.length} new menu item(s)`
    );
  }
);
