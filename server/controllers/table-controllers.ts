import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import { TableStatusEnum } from "../enums/models-enums.js";

import { tableService } from "../services/table-service.js";
import { tableRepository } from "../repositories/table-repository.js";

import { ApiResponse } from "../utils/api-response-formatter.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { ErrorHandler } from "../utils/error-handler.js";
import { GenerateReadableTableId } from "../utils/table-id-generator.js";
import {
  GenerateQRCodeDataURL,
  GenerateTableAccessURL,
} from "../utils/qr-code-generator.js";

export const CreateTable = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableNumber, capacity, location, status } = req.body;

    const existingTable = await tableRepository.findByTableNumber(tableNumber);
    if (existingTable) {
      throw new ErrorHandler(`Table #${tableNumber} already exists`, 409);
    }

    const tableId = GenerateReadableTableId(tableNumber);

    const qrCodeDataURL = await GenerateQRCodeDataURL({
      tableId,
      tableNumber,
    });

    const table = await tableRepository.create({
      tableId,
      tableNumber,
      capacity: capacity || 4,
      location: location || "Main Hall",
      status: status || TableStatusEnum.AVAILABLE,
      qrCodeUrl: qrCodeDataURL,
    });

    return ApiResponse.created(
      res,
      {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
        qrCodeUrl: table.qrCodeUrl,
        accessURL: GenerateTableAccessURL(table.tableId),
      },
      "Table created successfully"
    );
  }
);

export const CreateMultipleTables = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tables } = req.body;

    const createdTables = [];
    const failedTables = [];

    for (const tableData of tables) {
      try {
        const existing = await tableRepository.findByTableNumber(
          tableData.tableNumber
        );
        if (existing) {
          failedTables.push({
            tableNumber: tableData.tableNumber,
            reason: "Table number already exists",
          });
          continue;
        }

        const tableId = GenerateReadableTableId(tableData.tableNumber);
        const qrCodeDataURL = await GenerateQRCodeDataURL({
          tableId,
          tableNumber: tableData.tableNumber,
        });

        const table = await tableRepository.create({
          tableId,
          tableNumber: tableData.tableNumber,
          capacity: tableData.capacity || 4,
          location: tableData.location || "Main Hall",
          status: TableStatusEnum.AVAILABLE,
          qrCodeUrl: qrCodeDataURL,
        });

        createdTables.push(table);
      } catch (error) {
        failedTables.push({
          tableNumber: tableData.tableNumber,
          reason: (error as Error).message,
        });
      }
    }

    return ApiResponse.success(
      res,
      {
        created: createdTables.length,
        failed: failedTables.length,
        tables: createdTables.map((t) => ({
          tableId: t.tableId,
          tableNumber: t.tableNumber,
          capacity: t.capacity,
          status: t.status,
        })),
        failures: failedTables,
      },
      `Successfully created ${createdTables.length} table(s)`
    );
  }
);

export const GetAllTables = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const tables = await tableService.getAllTables();

    return ApiResponse.success(
      res,
      tables.map((table) => ({
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
        qrCodeUrl: table.qrCodeUrl,
      })),
      `Retrieved ${tables.length} table(s) successfully`
    );
  }
);

export const GetAvailableTables = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const tables = await tableService.getAvailableTables();

    return ApiResponse.success(
      res,
      tables.map((table) => ({
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
      })),
      `Found ${tables.length} available table(s)`
    );
  }
);

export const GetTableById = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;

    const table = await tableService.getTableById(tableId);

    return ApiResponse.success(
      res,
      {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
        qrCodeUrl: table.qrCodeUrl,
        accessURL: GenerateTableAccessURL(table.tableId),
        createdAt: table.createdAt,
      },
      "Table retrieved successfully"
    );
  }
);

export const GetTableByNumber = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableNumber } = req.params;

    const table = await tableService.getTableByNumber(Number(tableNumber));

    return ApiResponse.success(
      res,
      {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
        qrCodeUrl: table.qrCodeUrl,
      },
      "Table retrieved successfully"
    );
  }
);

export const UpdateTable = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;
    const updates = req.body;

    const updatedTable = await tableService.updateTable(tableId, updates);

    return ApiResponse.success(
      res,
      {
        tableId: updatedTable.tableId,
        tableNumber: updatedTable.tableNumber,
        capacity: updatedTable.capacity,
        location: updatedTable.location,
        status: updatedTable.status,
      },
      "Table updated successfully"
    );
  }
);

export const DeleteTable = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;

    await tableService.getTableById(tableId);

    const deletedTable = await tableRepository.deleteById(tableId);

    if (!deletedTable) {
      throw new ErrorHandler("Failed to delete table", 500);
    }

    return ApiResponse.success(
      res,
      {
        deleted: true,
        tableId,
        tableNumber: deletedTable.tableNumber,
      },
      "Table deleted successfully"
    );
  }
);

export const UpdateTableStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;
    const { status } = req.body;

    const updatedTable = await tableService.updateTableStatus(tableId, status);

    return ApiResponse.success(
      res,
      {
        tableId: updatedTable.tableId,
        tableNumber: updatedTable.tableNumber,
        status: updatedTable.status,
      },
      `Table marked as ${status}`
    );
  }
);

export const MarkTableAsOccupied = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;

    const table = await tableService.markAsOccupied(tableId);

    return ApiResponse.success(
      res,
      {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        status: table.status,
      },
      "Table marked as occupied"
    );
  }
);

export const MarkTableAsAvailable = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;

    const table = await tableService.markAsAvailable(tableId);

    return ApiResponse.success(
      res,
      {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        status: table.status,
      },
      "Table marked as available"
    );
  }
);

export const MarkTableAsReserved = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;

    const table = await tableService.markAsReserved(tableId);

    return ApiResponse.success(
      res,
      {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        status: table.status,
      },
      "Table marked as reserved"
    );
  }
);

export const MarkTableAsMaintenance = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;

    const table = await tableService.markAsMaintenance(tableId);

    return ApiResponse.success(
      res,
      {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        status: table.status,
      },
      "Table marked as under maintenance"
    );
  }
);

export const GetTablesByStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.params;

    const tables = await tableService.getTablesByStatus(
      status as TableStatusEnum
    );

    return ApiResponse.success(
      res,
      tables.map((table) => ({
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
      })),
      `Found ${tables.length} table(s) with status '${status}'`
    );
  }
);

export const GetTablesByCapacity = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { minCapacity } = req.query;

    const tables = await tableService.getTablesByCapacity(Number(minCapacity));

    return ApiResponse.success(
      res,
      tables.map((table) => ({
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
      })),
      `Found ${tables.length} table(s) with capacity >= ${minCapacity}`
    );
  }
);

export const GetTablesByLocation = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { location } = req.query;

    const tables = await tableService.getTablesByLocation(location as string);

    return ApiResponse.success(
      res,
      tables.map((table) => ({
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
      })),
      `Found ${tables.length} table(s) in location '${location}'`
    );
  }
);

export const RegenerateQRCode = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;

    const table = await tableService.getTableById(tableId);

    const qrCodeDataURL = await GenerateQRCodeDataURL({
      tableId: table.tableId,
      tableNumber: table.tableNumber,
    });

    const updatedTable = await tableRepository.updateByTableId(tableId, {
      qrCodeUrl: qrCodeDataURL,
    });

    if (!updatedTable) {
      throw new ErrorHandler("Failed to regenerate QR code", 500);
    }

    return ApiResponse.success(
      res,
      {
        tableId: updatedTable.tableId,
        tableNumber: updatedTable.tableNumber,
        qrCodeUrl: updatedTable.qrCodeUrl,
        accessURL: GenerateTableAccessURL(updatedTable.tableId),
        regeneratedAt: new Date().toISOString(),
      },
      "QR code regenerated successfully"
    );
  }
);

export const BulkUpdateTableStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableIds, status } = req.body;

    const updatedCount = await tableService.bulkUpdateStatus(tableIds, status);

    return ApiResponse.success(
      res,
      {
        requested: tableIds.length,
        updated: updatedCount,
        failed: tableIds.length - updatedCount,
        status,
      },
      `Successfully updated ${updatedCount} out of ${tableIds.length} table(s)`
    );
  }
);

export const GetTableStats = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await tableService.getTableStats();

    return ApiResponse.success(
      res,
      {
        total: stats.total,
        available: stats.available,
        occupied: stats.occupied,
        reserved: stats.reserved,
        maintenance: stats.maintenance,
        percentages: {
          availablePercentage:
            stats.total > 0
              ? Math.round((stats.available / stats.total) * 100)
              : 0,
          occupiedPercentage:
            stats.total > 0
              ? Math.round((stats.occupied / stats.total) * 100)
              : 0,
          reservedPercentage:
            stats.total > 0
              ? Math.round((stats.reserved / stats.total) * 100)
              : 0,
          maintenancePercentage:
            stats.total > 0
              ? Math.round((stats.maintenance / stats.total) * 100)
              : 0,
        },
        utilizationRate:
          stats.total > 0
            ? Math.round(
                ((stats.occupied + stats.reserved) / stats.total) * 100
              )
            : 0,
      },
      "Table statistics retrieved successfully"
    );
  }
);
