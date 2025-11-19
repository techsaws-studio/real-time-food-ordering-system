import { Router } from "express";

import {
  CreateOrGetBill,
  GetBillById,
  GetAllBills,
  GetCurrentBillBySession,
  GetBillsByTable,
  GetBillsByStatus,
  AddOrderToBill,
  ApplyPromoCode,
  RemovePromoCode,
  MarkBillPendingPayment,
  MarkBillPaid,
  CloseBill,
  VoidBill,
  UpdateBillCharges,
  GetBillStats,
  GetBillsByDateRange,
  GetRevenueByDateRange,
  GetAverageBillValue,
  GetCustomerBill,
  RequestBill,
  GetOpenBills,
  RecalculateBill,
} from "../controllers/bill-controllers.js";

import { ValidateRequest } from "../middlewares/validation-middleware.js";
import {
  VerifyStaffAuth,
  VerifyCustomerSession,
} from "../middlewares/auth-middleware.js";
import { RequireAdmin, RequireStaff } from "../middlewares/role-middleware.js";
import { VerifyActiveSession } from "../middlewares/session-middleware.js";

import {
  CreateOrGetBillSchema,
  GetBillByIdSchema,
  GetCurrentBillBySessionSchema,
  GetBillsByTableSchema,
  GetBillsByStatusSchema,
  AddOrderToBillSchema,
  ApplyPromoCodeSchema,
  RemovePromoCodeSchema,
  MarkBillPendingPaymentSchema,
  MarkBillPaidSchema,
  CloseBillSchema,
  VoidBillSchema,
  UpdateBillChargesSchema,
  GetBillStatsSchema,
  GetBillsByDateRangeSchema,
  GetRevenueByDateRangeSchema,
  RecalculateBillSchema,
} from "../validators/bill-validators.js";

const BillRouter = Router();
BillRouter.use(VerifyStaffAuth);

// PUBLIC ROUTES
BillRouter.get(
  "/my-bill",
  VerifyCustomerSession,
  VerifyActiveSession,
  GetCustomerBill
);
BillRouter.post(
  "/request",
  VerifyCustomerSession,
  VerifyActiveSession,
  RequestBill
);

// STAFF-PROTECTED ROUTES
BillRouter.get(
  "/stats",
  RequireStaff,
  ValidateRequest(GetBillStatsSchema),
  GetBillStats
);
BillRouter.get("/open", RequireStaff, GetOpenBills);
BillRouter.get(
  "/date-range",
  RequireStaff,
  ValidateRequest(GetBillsByDateRangeSchema),
  GetBillsByDateRange
);
BillRouter.get(
  "/status/:status",
  RequireStaff,
  ValidateRequest(GetBillsByStatusSchema),
  GetBillsByStatus
);
BillRouter.get(
  "/table/:tableId",
  RequireStaff,
  ValidateRequest(GetBillsByTableSchema),
  GetBillsByTable
);
BillRouter.get(
  "/session/:sessionId",
  RequireStaff,
  ValidateRequest(GetCurrentBillBySessionSchema),
  GetCurrentBillBySession
);
BillRouter.get("/", RequireStaff, GetAllBills);
BillRouter.post(
  "/",
  RequireStaff,
  ValidateRequest(CreateOrGetBillSchema),
  CreateOrGetBill
);
BillRouter.get(
  "/:billId",
  RequireStaff,
  ValidateRequest(GetBillByIdSchema),
  GetBillById
);
BillRouter.post(
  "/:billId/orders",
  RequireStaff,
  ValidateRequest(AddOrderToBillSchema),
  AddOrderToBill
);
BillRouter.post(
  "/:billId/promo",
  RequireStaff,
  ValidateRequest(ApplyPromoCodeSchema),
  ApplyPromoCode
);
BillRouter.delete(
  "/:billId/promo",
  RequireStaff,
  ValidateRequest(RemovePromoCodeSchema),
  RemovePromoCode
);
BillRouter.put(
  "/:billId/pending-payment",
  RequireStaff,
  ValidateRequest(MarkBillPendingPaymentSchema),
  MarkBillPendingPayment
);
BillRouter.put(
  "/:billId/paid",
  RequireStaff,
  ValidateRequest(MarkBillPaidSchema),
  MarkBillPaid
);
BillRouter.post(
  "/:billId/close",
  RequireStaff,
  ValidateRequest(CloseBillSchema),
  CloseBill
);

// ADMIN-ONLY ROUTES
BillRouter.get("/average", RequireAdmin, GetAverageBillValue);
BillRouter.get(
  "/revenue",
  RequireAdmin,
  ValidateRequest(GetRevenueByDateRangeSchema),
  GetRevenueByDateRange
);
BillRouter.post(
  "/:billId/void",
  RequireAdmin,
  ValidateRequest(VoidBillSchema),
  VoidBill
);
BillRouter.put(
  "/:billId/charges",
  RequireAdmin,
  ValidateRequest(UpdateBillChargesSchema),
  UpdateBillCharges
);
BillRouter.post(
  "/:billId/recalculate",
  RequireAdmin,
  ValidateRequest(RecalculateBillSchema),
  RecalculateBill
);

export default BillRouter;
