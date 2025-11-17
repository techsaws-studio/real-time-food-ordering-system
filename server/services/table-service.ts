import { ITable } from "../types/models-interfaces.js";
import { TableStatusEnum } from "../enums/models-enums.js";

import { tableRepository } from "../repositories/table-repository.js";

import { ErrorHandler } from "../utils/error-handler.js";

export class TableService {
  async getTableById(tableId: string): Promise<ITable> {
    const table = await tableRepository.findByTableId(tableId);

    if (!table) {
      throw new ErrorHandler(`Table with ID ${tableId} not found`, 404);
    }

    return table;
  }

  async getTableByNumber(tableNumber: number): Promise<ITable> {
    const table = await tableRepository.findByTableNumber(tableNumber);

    if (!table) {
      throw new ErrorHandler(`Table #${tableNumber} not found`, 404);
    }

    return table;
  }

  async getAllTables(): Promise<ITable[]> {
    return await tableRepository.findAll();
  }

  async getAvailableTables(): Promise<ITable[]> {
    return await tableRepository.findAvailableTables();
  }

  async getTablesByStatus(status: TableStatusEnum): Promise<ITable[]> {
    return await tableRepository.findByStatus(status);
  }

  async getTablesByCapacity(minCapacity: number): Promise<ITable[]> {
    if (minCapacity < 1) {
      throw new ErrorHandler("Capacity must be at least 1", 400);
    }

    return await tableRepository.getTablesByCapacity(minCapacity);
  }

  async getTablesByLocation(location: string): Promise<ITable[]> {
    if (!location || location.trim().length === 0) {
      throw new ErrorHandler("Location cannot be empty", 400);
    }

    return await tableRepository.getTablesByLocation(location);
  }

  async getTableStats(): Promise<{
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
  }> {
    const [stats, total] = await Promise.all([
      tableRepository.getTableStats(),
      tableRepository.getTotalCount(),
    ]);

    return {
      total,
      available: stats.available || 0,
      occupied: stats.occupied || 0,
      reserved: stats.reserved || 0,
      maintenance: stats.maintenance || 0,
    };
  }

  isTableAvailable(table: ITable): boolean {
    return table.status === TableStatusEnum.AVAILABLE;
  }

  async markAsOccupied(tableId: string): Promise<ITable> {
    const table = await this.getTableById(tableId);

    if (!this.isTableAvailable(table)) {
      throw new ErrorHandler(
        `Table ${tableId} is not available. Current status: ${table.status}`,
        400
      );
    }

    const updatedTable = await tableRepository.updateStatus(
      tableId,
      TableStatusEnum.OCCUPIED
    );

    if (!updatedTable) {
      throw new ErrorHandler("Failed to mark table as occupied", 500);
    }

    return updatedTable;
  }

  async markAsAvailable(tableId: string): Promise<ITable> {
    const table = await this.getTableById(tableId);

    if (table.status === TableStatusEnum.AVAILABLE) {
      throw new ErrorHandler(`Table ${tableId} is already available`, 400);
    }

    const updatedTable = await tableRepository.updateStatus(
      tableId,
      TableStatusEnum.AVAILABLE
    );

    if (!updatedTable) {
      throw new ErrorHandler("Failed to mark table as available", 500);
    }

    return updatedTable;
  }

  async markAsReserved(tableId: string): Promise<ITable> {
    const table = await this.getTableById(tableId);

    if (!this.isTableAvailable(table)) {
      throw new ErrorHandler(
        `Table ${tableId} cannot be reserved. Current status: ${table.status}`,
        400
      );
    }

    const updatedTable = await tableRepository.updateStatus(
      tableId,
      TableStatusEnum.RESERVED
    );

    if (!updatedTable) {
      throw new ErrorHandler("Failed to mark table as reserved", 500);
    }

    return updatedTable;
  }

  async markAsMaintenance(tableId: string): Promise<ITable> {
    await this.getTableById(tableId);

    const updatedTable = await tableRepository.updateStatus(
      tableId,
      TableStatusEnum.MAINTENANCE
    );

    if (!updatedTable) {
      throw new ErrorHandler("Failed to mark table as under maintenance", 500);
    }

    return updatedTable;
  }

  async updateTableStatus(
    tableId: string,
    status: TableStatusEnum
  ): Promise<ITable> {
    await this.getTableById(tableId);

    const updatedTable = await tableRepository.updateStatus(tableId, status);

    if (!updatedTable) {
      throw new ErrorHandler("Failed to update table status", 500);
    }

    return updatedTable;
  }

  async updateTable(
    tableId: string,
    updates: Partial<ITable>
  ): Promise<ITable> {
    await this.getTableById(tableId);

    const allowedUpdates: Partial<ITable> = {
      capacity: updates.capacity,
      location: updates.location,
      status: updates.status,
    };

    const updatedTable = await tableRepository.updateByTableId(
      tableId,
      allowedUpdates
    );

    if (!updatedTable) {
      throw new ErrorHandler("Failed to update table", 500);
    }

    return updatedTable;
  }

  async validateTableForSession(tableId: string): Promise<ITable> {
    const table = await this.getTableById(tableId);

    if (table.status === TableStatusEnum.MAINTENANCE) {
      throw new ErrorHandler(
        `Table ${tableId} is under maintenance and cannot be used`,
        403
      );
    }

    return table;
  }

  async bulkUpdateStatus(
    tableIds: string[],
    status: TableStatusEnum
  ): Promise<number> {
    let updatedCount = 0;

    for (const tableId of tableIds) {
      try {
        await this.updateTableStatus(tableId, status);
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update table ${tableId}:`, error);
      }
    }

    return updatedCount;
  }
}

export const tableService = new TableService();
