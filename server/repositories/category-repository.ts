import { ICategory } from "../types/models-interfaces.js";

import Category from "../models/category-model.js";

export class CategoryRepository {
  async findById(categoryId: string): Promise<ICategory | null> {
    return await Category.findOne({ categoryId });
  }

  async findByName(name: string): Promise<ICategory | null> {
    return await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
  }

  async findAll(): Promise<ICategory[]> {
    return await Category.find().sort({ displayOrder: 1, name: 1 });
  }

  async findActive(): Promise<ICategory[]> {
    return await Category.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1,
    });
  }

  async findInactive(): Promise<ICategory[]> {
    return await Category.find({ isActive: false }).sort({
      displayOrder: 1,
      name: 1,
    });
  }

  async create(data: {
    name: string;
    description?: string;
    displayOrder?: number;
  }): Promise<ICategory> {
    return await Category.create(data);
  }

  async updateById(
    categoryId: string,
    updates: Partial<ICategory>
  ): Promise<ICategory | null> {
    return await Category.findOneAndUpdate(
      { categoryId },
      { $set: updates },
      { new: true }
    );
  }

  async deleteById(categoryId: string): Promise<ICategory | null> {
    return await Category.findOneAndDelete({ categoryId });
  }

  async getTotalCount(): Promise<number> {
    return await Category.countDocuments();
  }

  async getActiveCount(): Promise<number> {
    return await Category.countDocuments({ isActive: true });
  }

  async reorderCategories(
    categoryOrders: { categoryId: string; displayOrder: number }[]
  ): Promise<void> {
    const bulkOps = categoryOrders.map((item) => ({
      updateOne: {
        filter: { categoryId: item.categoryId },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await Category.bulkWrite(bulkOps);
  }
}

export const categoryRepository = new CategoryRepository();
