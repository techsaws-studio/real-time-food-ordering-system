import { IMenuItem } from "../types/models-interfaces.js";
import { MenuItemTagEnum } from "../enums/models-enums.js";

import { menuItemRepository } from "../repositories/menu-item-repository.js";

import { categoryService } from "./category-service.js";

import { ErrorHandler } from "../utils/error-handler.js";

export class MenuItemService {
  async createMenuItem(data: {
    categoryId: string;
    name: string;
    description: string;
    price: number;
    images?: string[];
    preparationTime?: number;
    tags?: MenuItemTagEnum[];
    displayOrder?: number;
  }): Promise<IMenuItem> {
    const category = await categoryService.getCategoryById(data.categoryId);
    if (!category.isActive) {
      throw new ErrorHandler("Cannot add items to an inactive category", 400);
    }

    const existingItem = await menuItemRepository.findByName(data.name);
    if (existingItem) {
      throw new ErrorHandler("Menu item name already exists", 400);
    }

    if (data.price <= 0) {
      throw new ErrorHandler("Price must be greater than 0", 400);
    }

    if (data.displayOrder === undefined) {
      const totalItems = await menuItemRepository.getTotalCount();
      data.displayOrder = totalItems;
    }

    const menuItem = await menuItemRepository.create(data);
    return menuItem;
  }

  async getMenuItemById(itemId: string): Promise<IMenuItem> {
    const item = await menuItemRepository.findById(itemId);

    if (!item) {
      throw new ErrorHandler(`Menu item with ID ${itemId} not found`, 404);
    }

    return item;
  }

  async getAllMenuItems(): Promise<IMenuItem[]> {
    return await menuItemRepository.findAll();
  }

  async getAvailableMenuItems(): Promise<IMenuItem[]> {
    return await menuItemRepository.findAvailable();
  }

  async getMenuItemsByCategory(categoryId: string): Promise<IMenuItem[]> {
    await categoryService.getCategoryById(categoryId);
    return await menuItemRepository.findByCategory(categoryId);
  }

  async getAvailableMenuItemsByCategory(
    categoryId: string
  ): Promise<IMenuItem[]> {
    await categoryService.getCategoryById(categoryId);
    return await menuItemRepository.findAvailableByCategory(categoryId);
  }

  async getMenuItemsByTag(tag: MenuItemTagEnum): Promise<IMenuItem[]> {
    return await menuItemRepository.findByTag(tag);
  }

  async searchMenuItems(searchTerm: string): Promise<IMenuItem[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new ErrorHandler("Search term is required", 400);
    }

    return await menuItemRepository.searchItems(searchTerm);
  }

  async updateMenuItem(
    itemId: string,
    updates: Partial<IMenuItem>
  ): Promise<IMenuItem> {
    await this.getMenuItemById(itemId);

    if (updates.categoryId) {
      const category = await categoryService.getCategoryById(
        updates.categoryId
      );
      if (!category.isActive) {
        throw new ErrorHandler("Cannot move item to an inactive category", 400);
      }
    }

    if (updates.name) {
      const existingItem = await menuItemRepository.findByName(updates.name);
      if (existingItem && existingItem.itemId !== itemId) {
        throw new ErrorHandler("Menu item name already exists", 400);
      }
    }

    if (updates.price !== undefined && updates.price <= 0) {
      throw new ErrorHandler("Price must be greater than 0", 400);
    }

    const allowedUpdates: Partial<IMenuItem> = {
      categoryId: updates.categoryId,
      name: updates.name,
      description: updates.description,
      price: updates.price,
      images: updates.images,
      isAvailable: updates.isAvailable,
      preparationTime: updates.preparationTime,
      tags: updates.tags,
      displayOrder: updates.displayOrder,
    };

    const updatedItem = await menuItemRepository.updateById(
      itemId,
      allowedUpdates
    );

    if (!updatedItem) {
      throw new ErrorHandler("Failed to update menu item", 500);
    }

    return updatedItem;
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    await this.getMenuItemById(itemId);

    const deletedItem = await menuItemRepository.deleteById(itemId);

    if (!deletedItem) {
      throw new ErrorHandler("Failed to delete menu item", 500);
    }
  }

  async mark86(itemId: string): Promise<IMenuItem> {
    await this.getMenuItemById(itemId);

    const item = await menuItemRepository.markAsUnavailable(itemId);

    if (!item) {
      throw new ErrorHandler("Failed to mark item as unavailable", 500);
    }

    return item;
  }

  async unmark86(itemId: string): Promise<IMenuItem> {
    await this.getMenuItemById(itemId);

    const item = await menuItemRepository.markAsAvailable(itemId);

    if (!item) {
      throw new ErrorHandler("Failed to mark item as available", 500);
    }

    return item;
  }

  async bulk86(itemIds: string[]): Promise<number> {
    for (const itemId of itemIds) {
      await this.getMenuItemById(itemId);
    }

    return await menuItemRepository.bulkUpdateAvailability(itemIds, false);
  }

  async bulkUnmark86(itemIds: string[]): Promise<number> {
    for (const itemId of itemIds) {
      await this.getMenuItemById(itemId);
    }

    return await menuItemRepository.bulkUpdateAvailability(itemIds, true);
  }

  async reorderMenuItems(
    itemOrders: { itemId: string; displayOrder: number }[]
  ): Promise<void> {
    for (const item of itemOrders) {
      await this.getMenuItemById(item.itemId);
    }

    await menuItemRepository.reorderItems(itemOrders);
  }

  async getMenuItemStats(): Promise<{
    total: number;
    available: number;
    unavailable: number;
    byCategory: { categoryId: string; categoryName: string; count: number }[];
  }> {
    const [total, available, allItems, categories] = await Promise.all([
      menuItemRepository.getTotalCount(),
      menuItemRepository.getAvailableCount(),
      menuItemRepository.findAll(),
      categoryService.getAllCategories(),
    ]);

    const categoryMap = new Map(
      categories.map((cat) => [cat.categoryId, cat.name])
    );

    const byCategory = categories.map((cat) => ({
      categoryId: cat.categoryId,
      categoryName: cat.name,
      count: allItems.filter((item) => item.categoryId === cat.categoryId)
        .length,
    }));

    return {
      total,
      available,
      unavailable: total - available,
      byCategory,
    };
  }
}

export const menuItemService = new MenuItemService();
