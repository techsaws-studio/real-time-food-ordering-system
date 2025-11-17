import { IMenuItem } from "../types/models-interfaces.js";
import { MenuItemTagEnum } from "../enums/models-enums.js";

import MenuItem from "../models/menu-item-model.js";

export class MenuItemRepository {
  async findById(itemId: string): Promise<IMenuItem | null> {
    return await MenuItem.findOne({ itemId });
  }

  async findByName(name: string): Promise<IMenuItem | null> {
    return await MenuItem.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
  }

  async findAll(): Promise<IMenuItem[]> {
    return await MenuItem.find().sort({ displayOrder: 1, name: 1 });
  }

  async findByCategory(categoryId: string): Promise<IMenuItem[]> {
    return await MenuItem.find({ categoryId }).sort({
      displayOrder: 1,
      name: 1,
    });
  }

  async findAvailable(): Promise<IMenuItem[]> {
    return await MenuItem.find({ isAvailable: true }).sort({
      displayOrder: 1,
      name: 1,
    });
  }

  async findAvailableByCategory(categoryId: string): Promise<IMenuItem[]> {
    return await MenuItem.find({ categoryId, isAvailable: true }).sort({
      displayOrder: 1,
      name: 1,
    });
  }

  async findUnavailable(): Promise<IMenuItem[]> {
    return await MenuItem.find({ isAvailable: false }).sort({
      displayOrder: 1,
      name: 1,
    });
  }

  async findByTag(tag: MenuItemTagEnum): Promise<IMenuItem[]> {
    return await MenuItem.find({ tags: tag }).sort({
      displayOrder: 1,
      name: 1,
    });
  }

  async findByPriceRange(
    minPrice: number,
    maxPrice: number
  ): Promise<IMenuItem[]> {
    return await MenuItem.find({
      price: { $gte: minPrice, $lte: maxPrice },
    }).sort({ price: 1, name: 1 });
  }

  async searchItems(searchTerm: string): Promise<IMenuItem[]> {
    return await MenuItem.find({
      $text: { $search: searchTerm },
    }).sort({ displayOrder: 1, name: 1 });
  }

  async create(data: {
    categoryId: string;
    name: string;
    description: string;
    price: number;
    images?: string[];
    preparationTime?: number;
    tags?: MenuItemTagEnum[];
    displayOrder?: number;
  }): Promise<IMenuItem> {
    return await MenuItem.create(data);
  }

  async updateById(
    itemId: string,
    updates: Partial<IMenuItem>
  ): Promise<IMenuItem | null> {
    return await MenuItem.findOneAndUpdate(
      { itemId },
      { $set: updates },
      { new: true }
    );
  }

  async deleteById(itemId: string): Promise<IMenuItem | null> {
    return await MenuItem.findOneAndDelete({ itemId });
  }

  async deleteByCategoryId(categoryId: string): Promise<number> {
    const result = await MenuItem.deleteMany({ categoryId });
    return result.deletedCount;
  }

  async getTotalCount(): Promise<number> {
    return await MenuItem.countDocuments();
  }

  async getAvailableCount(): Promise<number> {
    return await MenuItem.countDocuments({ isAvailable: true });
  }

  async getCountByCategory(categoryId: string): Promise<number> {
    return await MenuItem.countDocuments({ categoryId });
  }

  async reorderItems(
    itemOrders: { itemId: string; displayOrder: number }[]
  ): Promise<void> {
    const bulkOps = itemOrders.map((item) => ({
      updateOne: {
        filter: { itemId: item.itemId },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    }));

    await MenuItem.bulkWrite(bulkOps);
  }

  async markAsUnavailable(itemId: string): Promise<IMenuItem | null> {
    return await MenuItem.findOneAndUpdate(
      { itemId },
      { $set: { isAvailable: false } },
      { new: true }
    );
  }

  async markAsAvailable(itemId: string): Promise<IMenuItem | null> {
    return await MenuItem.findOneAndUpdate(
      { itemId },
      { $set: { isAvailable: true } },
      { new: true }
    );
  }

  async bulkUpdateAvailability(
    itemIds: string[],
    isAvailable: boolean
  ): Promise<number> {
    const result = await MenuItem.updateMany(
      { itemId: { $in: itemIds } },
      { $set: { isAvailable } }
    );
    return result.modifiedCount;
  }
}

export const menuItemRepository = new MenuItemRepository();
