import { ITable } from "../types/models-interfaces.js";
import { TableStatusEnum } from "../enums/models-enums.js";

import Table from "../models/table-model.js";

export class TableRepository {
  async findById(id: string): Promise<ITable | null> {
    return await Table.findById(id);
  }

  async findByTableId(tableId: string): Promise<ITable | null> {
    return await Table.findOne({ tableId: tableId.toUpperCase() });
  }

  async findByTableNumber(tableNumber: number): Promise<ITable | null> {
    return await Table.findOne({ tableNumber });
  }

  async findAll(): Promise<ITable[]> {
    return await Table.find().sort({ tableNumber: 1 });
  }

  async findByStatus(status: TableStatusEnum): Promise<ITable[]> {
    return await Table.find({ status }).sort({ tableNumber: 1 });
  }

  async findAvailableTables(): Promise<ITable[]> {
    return await Table.find({ status: TableStatusEnum.AVAILABLE }).sort({
      tableNumber: 1,
    });
  }

  async create(data: Partial<ITable>): Promise<ITable> {
    return await Table.create(data);
  }

  async createMany(tables: Partial<ITable>[]): Promise<ITable[]> {
    const result = await Table.insertMany(tables);
    return result as ITable[];
  }

  async updateById(
    id: string,
    updates: Partial<ITable>
  ): Promise<ITable | null> {
    return await Table.findByIdAndUpdate(id, { $set: updates }, { new: true });
  }

  async updateByTableId(
    tableId: string,
    updates: Partial<ITable>
  ): Promise<ITable | null> {
    return await Table.findOneAndUpdate(
      { tableId: tableId.toUpperCase() },
      { $set: updates },
      { new: true }
    );
  }

  async updateStatus(
    tableId: string,
    status: TableStatusEnum
  ): Promise<ITable | null> {
    return await Table.findOneAndUpdate(
      { tableId: tableId.toUpperCase() },
      { $set: { status } },
      { new: true }
    );
  }

  async deleteById(id: string): Promise<ITable | null> {
    return await Table.findByIdAndDelete(id);
  }

  async deleteAll(): Promise<number> {
    const result = await Table.deleteMany({});
    return result.deletedCount;
  }

  async getTableStats(): Promise<{ [key: string]: number }> {
    const stats = await Table.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return stats.reduce((acc: any, curr: any) => {
      acc[curr._id.toLowerCase()] = curr.count;
      return acc;
    }, {});
  }

  async getTotalCount(): Promise<number> {
    return await Table.countDocuments();
  }

  async getTablesByCapacity(minCapacity: number): Promise<ITable[]> {
    return await Table.find({ capacity: { $gte: minCapacity } }).sort({
      capacity: 1,
      tableNumber: 1,
    });
  }

  async getTablesByLocation(location: string): Promise<ITable[]> {
    return await Table.find({
      location: { $regex: location, $options: "i" },
    }).sort({ tableNumber: 1 });
  }
}

export const tableRepository = new TableRepository();
