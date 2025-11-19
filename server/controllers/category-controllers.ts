import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import { categoryService } from "../services/category-service.js";

import { categoryRepository } from "../repositories/category-repository.js";
import { menuItemRepository } from "../repositories/menu-item-repository.js";

import { ApiResponse } from "../utils/api-response-formatter.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { ErrorHandler } from "../utils/error-handler.js";

export const CreateCategory = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description, displayOrder, isActive } = req.body;

    const category = await categoryService.createCategory({
      name,
      description,
      displayOrder,
    });

    return ApiResponse.created(
      res,
      {
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
      },
      "Category created successfully"
    );
  }
);

export const GetAllCategories = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await categoryService.getAllCategories();

    return ApiResponse.success(
      res,
      categories.map((category) => ({
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      })),
      `Retrieved ${categories.length} category(ies) successfully`
    );
  }
);

export const GetActiveCategories = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await categoryService.getActiveCategories();

    return ApiResponse.success(
      res,
      categories.map((category) => ({
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      })),
      `Retrieved ${categories.length} active category(ies) successfully`
    );
  }
);

export const GetInactiveCategories = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await categoryRepository.findInactive();

    return ApiResponse.success(
      res,
      categories.map((category) => ({
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      })),
      `Retrieved ${categories.length} inactive category(ies) successfully`
    );
  }
);

export const GetCategoryById = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    const category = await categoryService.getCategoryById(categoryId);

    return ApiResponse.success(
      res,
      {
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
      "Category retrieved successfully"
    );
  }
);

export const GetCategoryWithMenuItems = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const { includeUnavailable } = req.query;

    const category = await categoryService.getCategoryById(categoryId);

    let menuItems;
    if (includeUnavailable === "true") {
      menuItems = await menuItemRepository.findByCategory(categoryId);
    } else {
      menuItems = await menuItemRepository.findAvailableByCategory(categoryId);
    }

    return ApiResponse.success(
      res,
      {
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
        menuItemsCount: menuItems.length,
        menuItems: menuItems.map((item) => ({
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
      "Category with menu items retrieved successfully"
    );
  }
);

export const UpdateCategory = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const updates = req.body;

    const updatedCategory = await categoryService.updateCategory(
      categoryId,
      updates
    );

    return ApiResponse.success(
      res,
      {
        categoryId: updatedCategory.categoryId,
        name: updatedCategory.name,
        description: updatedCategory.description,
        displayOrder: updatedCategory.displayOrder,
        isActive: updatedCategory.isActive,
        updatedAt: updatedCategory.updatedAt,
      },
      "Category updated successfully"
    );
  }
);

export const DeleteCategory = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    const category = await categoryService.getCategoryById(categoryId);

    await categoryService.deleteCategory(categoryId);

    return ApiResponse.success(
      res,
      {
        deleted: true,
        categoryId,
        name: category.name,
      },
      "Category deleted successfully"
    );
  }
);

export const ReorderCategories = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryOrders } = req.body;

    await categoryService.reorderCategories(categoryOrders);

    const updatedCategories = await categoryService.getAllCategories();

    return ApiResponse.success(
      res,
      {
        reordered: categoryOrders.length,
        categories: updatedCategories.map((category) => ({
          categoryId: category.categoryId,
          name: category.name,
          displayOrder: category.displayOrder,
        })),
      },
      `Successfully reordered ${categoryOrders.length} category(ies)`
    );
  }
);

export const ActivateCategory = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    const category = await categoryService.getCategoryById(categoryId);

    if (category.isActive) {
      throw new ErrorHandler("Category is already active", 400);
    }

    const updatedCategory = await categoryService.updateCategory(categoryId, {
      isActive: true,
    });

    return ApiResponse.success(
      res,
      {
        categoryId: updatedCategory.categoryId,
        name: updatedCategory.name,
        isActive: updatedCategory.isActive,
      },
      "Category activated successfully"
    );
  }
);

export const DeactivateCategory = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    const category = await categoryService.getCategoryById(categoryId);

    if (!category.isActive) {
      throw new ErrorHandler("Category is already inactive", 400);
    }

    const updatedCategory = await categoryService.updateCategory(categoryId, {
      isActive: false,
    });

    return ApiResponse.success(
      res,
      {
        categoryId: updatedCategory.categoryId,
        name: updatedCategory.name,
        isActive: updatedCategory.isActive,
      },
      "Category deactivated successfully"
    );
  }
);

export const ToggleCategoryStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;

    const category = await categoryService.getCategoryById(categoryId);

    const updatedCategory = await categoryService.updateCategory(categoryId, {
      isActive: !category.isActive,
    });

    return ApiResponse.success(
      res,
      {
        categoryId: updatedCategory.categoryId,
        name: updatedCategory.name,
        isActive: updatedCategory.isActive,
        statusChanged: category.isActive ? "deactivated" : "activated",
      },
      `Category ${
        updatedCategory.isActive ? "activated" : "deactivated"
      } successfully`
    );
  }
);

export const GetCategoryStats = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await categoryService.getCategoryStats();

    const categories = await categoryService.getAllCategories();
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const itemCount = await menuItemRepository.getCountByCategory(
          category.categoryId
        );
        return {
          categoryId: category.categoryId,
          name: category.name,
          isActive: category.isActive,
          menuItemsCount: itemCount,
        };
      })
    );

    return ApiResponse.success(
      res,
      {
        total: stats.total,
        active: stats.active,
        inactive: stats.inactive,
        percentages: {
          activePercentage:
            stats.total > 0
              ? Math.round((stats.active / stats.total) * 100)
              : 0,
          inactivePercentage:
            stats.total > 0
              ? Math.round((stats.inactive / stats.total) * 100)
              : 0,
        },
        categories: categoriesWithCounts,
      },
      "Category statistics retrieved successfully"
    );
  }
);

export const SearchCategories = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { searchTerm, includeInactive } = req.query;

    if (!searchTerm || typeof searchTerm !== "string") {
      throw new ErrorHandler("Search term is required", 400);
    }

    let categories;
    if (includeInactive === "true") {
      categories = await categoryRepository.findAll();
    } else {
      categories = await categoryRepository.findActive();
    }

    const filteredCategories = categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description &&
          category.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return ApiResponse.success(
      res,
      filteredCategories.map((category) => ({
        categoryId: category.categoryId,
        name: category.name,
        description: category.description,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      })),
      `Found ${filteredCategories.length} category(ies) matching '${searchTerm}'`
    );
  }
);

export const BulkDeleteCategories = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryIds, force } = req.body;

    const deleted: string[] = [];
    const failed: { categoryId: string; reason: string }[] = [];

    for (const categoryId of categoryIds) {
      try {
        const itemCount = await menuItemRepository.getCountByCategory(
          categoryId
        );

        if (itemCount > 0 && !force) {
          failed.push({
            categoryId,
            reason: `Has ${itemCount} menu item(s). Use force=true to delete anyway.`,
          });
          continue;
        }

        if (itemCount > 0 && force) {
          await menuItemRepository.deleteByCategoryId(categoryId);
        }

        await categoryService.deleteCategory(categoryId);
        deleted.push(categoryId);
      } catch (error) {
        failed.push({
          categoryId,
          reason: (error as Error).message,
        });
      }
    }

    return ApiResponse.success(
      res,
      {
        requested: categoryIds.length,
        deleted: deleted.length,
        failed: failed.length,
        deletedIds: deleted,
        failures: failed,
      },
      `Successfully deleted ${deleted.length} out of ${categoryIds.length} category(ies)`
    );
  }
);

export const DuplicateCategory = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const { newName, copyMenuItems } = req.body;

    const originalCategory = await categoryService.getCategoryById(categoryId);

    const newCategory = await categoryService.createCategory({
      name: newName,
      description: originalCategory.description || undefined,
      displayOrder: originalCategory.displayOrder + 1,
    });

    let copiedItemsCount = 0;

    if (copyMenuItems) {
      const menuItems = await menuItemRepository.findByCategory(categoryId);

      for (const item of menuItems) {
        await menuItemRepository.create({
          categoryId: newCategory.categoryId,
          name: `${item.name} (Copy)`,
          description: item.description,
          price: item.price,
          images: item.images,
          preparationTime: item.preparationTime,
          tags: item.tags,
          displayOrder: item.displayOrder,
        });
        copiedItemsCount++;
      }
    }

    return ApiResponse.created(
      res,
      {
        categoryId: newCategory.categoryId,
        name: newCategory.name,
        description: newCategory.description,
        displayOrder: newCategory.displayOrder,
        isActive: newCategory.isActive,
        copiedFrom: originalCategory.categoryId,
        menuItemsCopied: copiedItemsCount,
      },
      `Category duplicated successfully${
        copyMenuItems ? ` with ${copiedItemsCount} menu item(s)` : ""
      }`
    );
  }
);

export const MergeCategories = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sourceCategoryIds, targetCategoryId, deleteSourceCategories } =
      req.body;

    const targetCategory = await categoryService.getCategoryById(
      targetCategoryId
    );

    let totalItemsMoved = 0;
    const mergedCategories: string[] = [];

    for (const sourceCategoryId of sourceCategoryIds) {
      if (sourceCategoryId === targetCategoryId) {
        continue;
      }

      const sourceCategory = await categoryService.getCategoryById(
        sourceCategoryId
      );

      const menuItems = await menuItemRepository.findByCategory(
        sourceCategoryId
      );

      for (const item of menuItems) {
        await menuItemRepository.updateById(item.itemId, {
          categoryId: targetCategoryId,
        });
        totalItemsMoved++;
      }

      mergedCategories.push(sourceCategory.name);

      if (deleteSourceCategories) {
        await categoryRepository.deleteById(sourceCategoryId);
      }
    }

    return ApiResponse.success(
      res,
      {
        targetCategoryId,
        targetCategoryName: targetCategory.name,
        mergedCategories,
        itemsMoved: totalItemsMoved,
        sourceCategoriesDeleted: deleteSourceCategories,
      },
      `Successfully merged ${mergedCategories.length} category(ies) into '${targetCategory.name}'`
    );
  }
);
