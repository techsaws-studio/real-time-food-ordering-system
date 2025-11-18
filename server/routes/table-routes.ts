import { Router } from "express";

import {
  CreateTable,
  CreateMultipleTables,
  GetAllTables,
  GetAvailableTables,
  GetTableById,
  GetTableByNumber,
  UpdateTable,
  DeleteTable,
  UpdateTableStatus,
  MarkTableAsOccupied,
  MarkTableAsAvailable,
  MarkTableAsReserved,
  MarkTableAsMaintenance,
  GetTablesByStatus,
  GetTablesByCapacity,
  GetTablesByLocation,
  RegenerateQRCode,
  BulkUpdateTableStatus,
  GetTableStats,
} from "../controllers/table-controllers.js";

import { ValidateRequest } from "../middlewares/validation-middleware.js";
import { VerifyStaffAuth } from "../middlewares/auth-middleware.js";
import { RequireAdmin, RequireStaff } from "../middlewares/role-middleware.js";

import {
  CreateTableSchema,
  CreateMultipleTablesSchema,
  GetTableByIdSchema,
  GetTableByNumberSchema,
  UpdateTableSchema,
  DeleteTableSchema,
  UpdateTableStatusSchema,
  MarkTableAsOccupiedSchema,
  MarkTableAsAvailableSchema,
  MarkTableAsReservedSchema,
  MarkTableAsMaintenanceSchema,
  GetTablesByStatusSchema,
  GetTablesByCapacitySchema,
  GetTablesByLocationSchema,
  RegenerateQRCodeSchema,
  BulkUpdateTableStatusSchema,
  GetTableStatsSchema,
} from "../validators/table-validators.js";

const TableRouter = Router();
TableRouter.use(VerifyStaffAuth);

TableRouter.get(
  "/stats",
  RequireStaff,
  ValidateRequest(GetTableStatsSchema),
  GetTableStats
);
TableRouter.post(
  "/bulk",
  RequireAdmin,
  ValidateRequest(CreateMultipleTablesSchema),
  CreateMultipleTables
);
TableRouter.put(
  "/bulk/status",
  RequireAdmin,
  ValidateRequest(BulkUpdateTableStatusSchema),
  BulkUpdateTableStatus
);
TableRouter.get("/available", RequireStaff, GetAvailableTables);
TableRouter.get(
  "/status/:status",
  RequireStaff,
  ValidateRequest(GetTablesByStatusSchema),
  GetTablesByStatus
);
TableRouter.get(
  "/capacity",
  RequireStaff,
  ValidateRequest(GetTablesByCapacitySchema),
  GetTablesByCapacity
);
TableRouter.get(
  "/location",
  RequireStaff,
  ValidateRequest(GetTablesByLocationSchema),
  GetTablesByLocation
);
TableRouter.get(
  "/number/:tableNumber",
  RequireStaff,
  ValidateRequest(GetTableByNumberSchema),
  GetTableByNumber
);
TableRouter.get("/", RequireStaff, GetAllTables);
TableRouter.post(
  "/",
  RequireAdmin,
  ValidateRequest(CreateTableSchema),
  CreateTable
);
TableRouter.get(
  "/:tableId",
  RequireStaff,
  ValidateRequest(GetTableByIdSchema),
  GetTableById
);
TableRouter.put(
  "/:tableId",
  RequireAdmin,
  ValidateRequest(UpdateTableSchema),
  UpdateTable
);
TableRouter.delete(
  "/:tableId",
  RequireAdmin,
  ValidateRequest(DeleteTableSchema),
  DeleteTable
);
TableRouter.put(
  "/:tableId/status",
  RequireStaff,
  ValidateRequest(UpdateTableStatusSchema),
  UpdateTableStatus
);
TableRouter.put(
  "/:tableId/mark-occupied",
  RequireStaff,
  ValidateRequest(MarkTableAsOccupiedSchema),
  MarkTableAsOccupied
);
TableRouter.put(
  "/:tableId/mark-available",
  RequireStaff,
  ValidateRequest(MarkTableAsAvailableSchema),
  MarkTableAsAvailable
);
TableRouter.put(
  "/:tableId/mark-reserved",
  RequireStaff,
  ValidateRequest(MarkTableAsReservedSchema),
  MarkTableAsReserved
);
TableRouter.put(
  "/:tableId/mark-maintenance",
  RequireAdmin,
  ValidateRequest(MarkTableAsMaintenanceSchema),
  MarkTableAsMaintenance
);
TableRouter.post(
  "/:tableId/regenerate-qr",
  RequireAdmin,
  ValidateRequest(RegenerateQRCodeSchema),
  RegenerateQRCode
);

export default TableRouter;
