import { Router } from "express";

import {
  CreateOrder,
  GetOrderById,
  GetAllOrders,
  GetOrdersByTable,
  GetOrdersBySession,
  GetOrdersByStatus,
  GetActiveOrders,
  GetKitchenOrders,
  AcceptOrder,
  RejectOrder,
  UpdateOrderStatus,
  MarkOrderInKitchen,
  MarkOrderReady,
  MarkOrderServed,
  CancelOrder,
  BulkUpdateOrderStatus,
  GetOrderStats,
  GetOrdersByDateRange,
  GetRevenueByDateRange,
  GetCustomerOrder,
  GetCustomerSessionOrders,
} from "../controllers/order-controllers.js";

import { ValidateRequest } from "../middlewares/validation-middleware.js";
import {
  VerifyStaffAuth,
  VerifyCustomerSession,
} from "../middlewares/auth-middleware.js";
import {
  RequireAdmin,
  RequireStaff,
  RequireKitchenOrAdmin,
} from "../middlewares/role-middleware.js";
import {
  VerifyActiveSession,
  VerifyCanPlaceOrder,
} from "../middlewares/session-middleware.js";

import {
  CreateOrderSchema,
  GetOrderByIdSchema,
  GetOrdersByTableSchema,
  GetOrdersBySessionSchema,
  GetOrdersByStatusSchema,
  GetActiveOrdersSchema,
  GetKitchenOrdersSchema,
  AcceptOrderSchema,
  RejectOrderSchema,
  UpdateOrderStatusSchema,
  MarkOrderInKitchenSchema,
  MarkOrderReadySchema,
  MarkOrderServedSchema,
  CancelOrderSchema,
  BulkUpdateOrderStatusSchema,
  GetOrderStatsSchema,
  GetOrdersByDateRangeSchema,
  GetOrderRevenueStatsSchema,
} from "../validators/order-validators.js";

const OrderRouter = Router();
OrderRouter.use(VerifyStaffAuth);

// PUBLIC ROUTES
OrderRouter.post(
  "/",
  VerifyCustomerSession,
  VerifyActiveSession,
  VerifyCanPlaceOrder,
  ValidateRequest(CreateOrderSchema),
  CreateOrder
);
OrderRouter.get(
  "/my-orders",
  VerifyCustomerSession,
  VerifyActiveSession,
  GetCustomerSessionOrders
);
OrderRouter.get(
  "/my-orders/:orderId",
  VerifyCustomerSession,
  VerifyActiveSession,
  ValidateRequest(GetOrderByIdSchema),
  GetCustomerOrder
);

// STAFF-PROTECTED ROUTES
OrderRouter.get(
  "/stats",
  RequireStaff,
  ValidateRequest(GetOrderStatsSchema),
  GetOrderStats
);
OrderRouter.get(
  "/kitchen",
  RequireKitchenOrAdmin,
  ValidateRequest(GetKitchenOrdersSchema),
  GetKitchenOrders
);
OrderRouter.get(
  "/active",
  RequireStaff,
  ValidateRequest(GetActiveOrdersSchema),
  GetActiveOrders
);
OrderRouter.get(
  "/date-range",
  RequireStaff,
  ValidateRequest(GetOrdersByDateRangeSchema),
  GetOrdersByDateRange
);
OrderRouter.put(
  "/bulk-status",
  RequireKitchenOrAdmin,
  ValidateRequest(BulkUpdateOrderStatusSchema),
  BulkUpdateOrderStatus
);
OrderRouter.get(
  "/status/:status",
  RequireStaff,
  ValidateRequest(GetOrdersByStatusSchema),
  GetOrdersByStatus
);
OrderRouter.get(
  "/table/:tableId",
  RequireStaff,
  ValidateRequest(GetOrdersByTableSchema),
  GetOrdersByTable
);
OrderRouter.get(
  "/session/:sessionId",
  RequireStaff,
  ValidateRequest(GetOrdersBySessionSchema),
  GetOrdersBySession
);
OrderRouter.get("/", RequireStaff, GetAllOrders);
OrderRouter.get(
  "/:orderId",
  RequireStaff,
  ValidateRequest(GetOrderByIdSchema),
  GetOrderById
);
OrderRouter.put(
  "/:orderId/accept",
  RequireKitchenOrAdmin,
  ValidateRequest(AcceptOrderSchema),
  AcceptOrder
);
OrderRouter.put(
  "/:orderId/reject",
  RequireKitchenOrAdmin,
  ValidateRequest(RejectOrderSchema),
  RejectOrder
);
OrderRouter.put(
  "/:orderId/in-kitchen",
  RequireKitchenOrAdmin,
  ValidateRequest(MarkOrderInKitchenSchema),
  MarkOrderInKitchen
);
OrderRouter.put(
  "/:orderId/ready",
  RequireKitchenOrAdmin,
  ValidateRequest(MarkOrderReadySchema),
  MarkOrderReady
);
OrderRouter.put(
  "/:orderId/served",
  RequireStaff,
  ValidateRequest(MarkOrderServedSchema),
  MarkOrderServed
);
OrderRouter.put(
  "/:orderId/cancel",
  RequireStaff,
  ValidateRequest(CancelOrderSchema),
  CancelOrder
);
OrderRouter.patch(
  "/:orderId/status",
  RequireKitchenOrAdmin,
  ValidateRequest(UpdateOrderStatusSchema),
  UpdateOrderStatus
);

// ADMIN-ONLY ROUTES
OrderRouter.get(
  "/revenue",
  RequireAdmin,
  ValidateRequest(GetOrderRevenueStatsSchema),
  GetRevenueByDateRange
);

export default OrderRouter;
