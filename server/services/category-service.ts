import { ICategory } from "../types/models-interfaces.js";

import { categoryRepository } from "../repositories/category-repository.js";
import { menuItemRepository } from "../repositories/menu-item-repository.js";

import { ErrorHandler } from "../utils/error-handler.js";

export class CategoryService {
  async createCategory(data: {
    name: string;
    description?: string;
    displayOrder?: number;
  }): Promise<ICategory> {
    const existingCategory = await categoryRepository.findByName(data.name);
    if (existingCategory) {
      throw new ErrorHandler("Category name already exists", 400);
    }

    if (data.displayOrder === undefined) {
      const totalCategories = await categoryRepository.getTotalCount();
      data.displayOrder = totalCategories;
    }

    const category = await categoryRepository.create(data);
    return category;
  }

  async getCategoryById(categoryId: string): Promise<ICategory> {
    const category = await categoryRepository.findById(categoryId);

    if (!category) {
      throw new ErrorHandler(`Category with ID ${categoryId} not found`, 404);
    }
    return category;
  }

  async getAllCategories(): Promise<ICategory[]> {
    return await categoryRepository.findAll();
  }

  async getActiveCategories(): Promise<ICategory[]> {
    return await categoryRepository.findActive();
  }

  async updateCategory(
    categoryId: string,
    updates: Partial<ICategory>
  ): Promise<ICategory> {
    await this.getCategoryById(categoryId);

    if (updates.name) {
      const existingCategory = await categoryRepository.findByName(
        updates.name
      );
      if (existingCategory && existingCategory.categoryId !== categoryId) {
        throw new ErrorHandler("Category name already exists", 400);
      }
    }

    const allowedUpdates: Partial<ICategory> = {
      name: updates.name,
      description: updates.description,
      displayOrder: updates.displayOrder,
      isActive: updates.isActive,
    };

    const updatedCategory = await categoryRepository.updateById(
      categoryId,
      allowedUpdates
    );

    if (!updatedCategory) {
      throw new ErrorHandler("Failed to update category", 500);
    }

    return updatedCategory;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await this.getCategoryById(categoryId);

    const itemCount = await menuItemRepository.getCountByCategory(categoryId);
    if (itemCount > 0) {
      throw new ErrorHandler(
        `Cannot delete category. It has ${itemCount} menu items. Please delete or reassign items first.`,
        400
      );
    }

    const deletedCategory = await categoryRepository.deleteById(categoryId);

    if (!deletedCategory) {
      throw new ErrorHandler("Failed to delete category", 500);
    }
  }

  async reorderCategories(
    categoryOrders: { categoryId: string; displayOrder: number }[]
  ): Promise<void> {
    for (const item of categoryOrders) {
      await this.getCategoryById(item.categoryId);
    }

    await categoryRepository.reorderCategories(categoryOrders);
  }

  async getCategoryStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active] = await Promise.all([
      categoryRepository.getTotalCount(),
      categoryRepository.getActiveCount(),
    ]);

    return {
      total,
      active,
      inactive: total - active,
    };
  }
}

export const categoryService = new CategoryService();
