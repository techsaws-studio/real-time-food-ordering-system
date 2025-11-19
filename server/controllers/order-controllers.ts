import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import { OrderStatusEnum } from "../enums/models-enums.js";

import { orderService } from "../services/order-service.js";
import { tableService } from "../services/table-service.js";
import { tableSessionService } from "../services/table-session-service.js";

import { orderRepository } from "../repositories/order-repository.js";

import { ApiResponse } from "../utils/api-response-formatter.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { ErrorHandler } from "../utils/error-handler.js";

export const CreateOrder = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId, sessionId, items, specialInstructions } = req.body;

    const order = await orderService.createOrder({
      tableId,
      sessionId,
      items,
      specialInstructions,
    });

    const table = await tableService.getTableById(order.tableId);

    return ApiResponse.created(
      res,
      {
        orderId: order.orderId,
        tableId: order.tableId,
        tableNumber: table.tableNumber,
        sessionId: order.sessionId,
        items: order.items.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations,
          subtotal: item.subtotal,
        })),
        specialInstructions: order.specialInstructions,
        totalAmount: order.totalAmount,
        status: order.status,
        placedAt: order.placedAt,
      },
      "Order placed successfully"
    );
  }
);

export const GetOrderById = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await orderService.getOrderById(orderId);
    const table = await tableService.getTableById(order.tableId);

    return ApiResponse.success(
      res,
      {
        orderId: order.orderId,
        tableId: order.tableId,
        tableNumber: table.tableNumber,
        location: table.location,
        sessionId: order.sessionId,
        items: order.items.map((item) => ({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations,
          subtotal: item.subtotal,
        })),
        status: order.status,
        specialInstructions: order.specialInstructions,
        estimatedTime: order.estimatedTime,
        totalAmount: order.totalAmount,
        placedAt: order.placedAt,
        acceptedAt: order.acceptedAt,
        acceptedBy: order.acceptedBy,
        inKitchenAt: order.inKitchenAt,
        readyAt: order.readyAt,
        servedAt: order.servedAt,
        rejectedAt: order.rejectedAt,
        rejectedBy: order.rejectedBy,
        rejectionReason: order.rejectionReason,
        cancelledAt: order.cancelledAt,
        cancelledBy: order.cancelledBy,
        cancellationReason: order.cancellationReason,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      "Order retrieved successfully"
    );
  }
);

export const GetAllOrders = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const orders = await orderService.getAllOrders();

    return ApiResponse.success(
      res,
      orders.map((order) => ({
        orderId: order.orderId,
        tableId: order.tableId,
        sessionId: order.sessionId,
        itemsCount: order.items.length,
        status: order.status,
        totalAmount: order.totalAmount,
        placedAt: order.placedAt,
        estimatedTime: order.estimatedTime,
      })),
      `Retrieved ${orders.length} order(s) successfully`
    );
  }
);

export const GetOrdersByTable = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;
    const { status, activeOnly } = req.query;

    const table = await tableService.getTableById(tableId);

    let orders;
    if (activeOnly === "true") {
      orders = await orderService.getActiveOrdersByTable(tableId);
    } else {
      orders = await orderService.getOrdersByTable(tableId);
    }

    if (status && typeof status === "string") {
      orders = orders.filter((order) => order.status === status);
    }

    return ApiResponse.success(
      res,
      {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        location: table.location,
        ordersCount: orders.length,
        orders: orders.map((order) => ({
          orderId: order.orderId,
          sessionId: order.sessionId,
          items: order.items.map((item) => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
          status: order.status,
          totalAmount: order.totalAmount,
          placedAt: order.placedAt,
          estimatedTime: order.estimatedTime,
        })),
      },
      `Retrieved ${orders.length} order(s) for table ${table.tableNumber}`
    );
  }
);

export const GetOrdersBySession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const { status } = req.query;

    const session = await tableSessionService.getSessionById(sessionId);
    const table = await tableService.getTableById(session.tableId);

    let orders = await orderService.getOrdersBySession(sessionId);

    if (status && typeof status === "string") {
      orders = orders.filter((order) => order.status === status);
    }

    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    return ApiResponse.success(
      res,
      {
        sessionId: session.sessionId,
        tableId: session.tableId,
        tableNumber: table.tableNumber,
        ordersCount: orders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        orders: orders.map((order) => ({
          orderId: order.orderId,
          items: order.items.map((item) => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
          status: order.status,
          totalAmount: order.totalAmount,
          placedAt: order.placedAt,
          estimatedTime: order.estimatedTime,
        })),
      },
      `Retrieved ${orders.length} order(s) for session`
    );
  }
);

export const GetOrdersByStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.params;

    const orders = await orderRepository.findByStatus(
      status as OrderStatusEnum
    );

    const ordersWithTableInfo = await Promise.all(
      orders.map(async (order) => {
        const table = await tableService.getTableById(order.tableId);
        return {
          orderId: order.orderId,
          tableId: order.tableId,
          tableNumber: table.tableNumber,
          location: table.location,
          sessionId: order.sessionId,
          itemsCount: order.items.length,
          status: order.status,
          totalAmount: order.totalAmount,
          placedAt: order.placedAt,
          estimatedTime: order.estimatedTime,
        };
      })
    );

    return ApiResponse.success(
      res,
      ordersWithTableInfo,
      `Retrieved ${orders.length} order(s) with status '${status}'`
    );
  }
);

export const GetActiveOrders = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.query;

    let orders;
    if (tableId && typeof tableId === "string") {
      orders = await orderService.getActiveOrdersByTable(tableId);
    } else {
      orders = await orderService.getActiveOrders();
    }

    const ordersWithTableInfo = await Promise.all(
      orders.map(async (order) => {
        const table = await tableService.getTableById(order.tableId);
        return {
          orderId: order.orderId,
          tableId: order.tableId,
          tableNumber: table.tableNumber,
          location: table.location,
          sessionId: order.sessionId,
          items: order.items.map((item) => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            customizations: item.customizations,
            subtotal: item.subtotal,
          })),
          status: order.status,
          specialInstructions: order.specialInstructions,
          totalAmount: order.totalAmount,
          placedAt: order.placedAt,
          estimatedTime: order.estimatedTime,
          acceptedAt: order.acceptedAt,
          inKitchenAt: order.inKitchenAt,
          readyAt: order.readyAt,
        };
      })
    );

    return ApiResponse.success(
      res,
      {
        count: ordersWithTableInfo.length,
        orders: ordersWithTableInfo,
      },
      `Retrieved ${ordersWithTableInfo.length} active order(s)`
    );
  }
);

export const GetKitchenOrders = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { includeReady } = req.query;

    let orders = await orderService.getKitchenOrders();

    if (includeReady === "true") {
      const readyOrders = await orderRepository.findByStatus(
        OrderStatusEnum.READY
      );
      orders = [...orders, ...readyOrders];
    }

    orders.sort((a, b) => {
      const statusPriority: { [key: string]: number } = {
        [OrderStatusEnum.PLACED]: 1,
        [OrderStatusEnum.ACCEPTED]: 2,
        [OrderStatusEnum.IN_KITCHEN]: 3,
        [OrderStatusEnum.READY]: 4,
      };

      const priorityDiff =
        (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);

      if (priorityDiff !== 0) return priorityDiff;

      return new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime();
    });

    const ordersWithTableInfo = await Promise.all(
      orders.map(async (order) => {
        const table = await tableService.getTableById(order.tableId);

        const waitTime = Math.round(
          (Date.now() - new Date(order.placedAt).getTime()) / 60000
        );

        return {
          orderId: order.orderId,
          tableId: order.tableId,
          tableNumber: table.tableNumber,
          location: table.location,
          items: order.items.map((item) => ({
            itemId: item.itemId,
            name: item.name,
            quantity: item.quantity,
            customizations: item.customizations,
          })),
          status: order.status,
          specialInstructions: order.specialInstructions,
          estimatedTime: order.estimatedTime,
          placedAt: order.placedAt,
          acceptedAt: order.acceptedAt,
          inKitchenAt: order.inKitchenAt,
          readyAt: order.readyAt,
          waitTimeMinutes: waitTime,
          isUrgent: waitTime > 15,
        };
      })
    );

    return ApiResponse.success(
      res,
      {
        count: ordersWithTableInfo.length,
        orders: ordersWithTableInfo,
      },
      `Retrieved ${ordersWithTableInfo.length} kitchen order(s)`
    );
  }
);

export const AcceptOrder = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { estimatedTime } = req.body;
    const acceptedBy = req.user?.userId;

    if (!acceptedBy) {
      throw new ErrorHandler("User ID not found in request", 401);
    }

    const order = await orderService.acceptOrder(
      orderId,
      acceptedBy,
      estimatedTime
    );

    const table = await tableService.getTableById(order.tableId);

    return ApiResponse.success(
      res,
      {
        orderId: order.orderId,
        tableId: order.tableId,
        tableNumber: table.tableNumber,
        status: order.status,
        estimatedTime: order.estimatedTime,
        acceptedAt: order.acceptedAt,
        acceptedBy: order.acceptedBy,
      },
      `Order accepted. Estimated time: ${estimatedTime} minutes`
    );
  }
);

export const RejectOrder = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { rejectionReason } = req.body;
    const rejectedBy = req.user?.userId;

    if (!rejectedBy) {
      throw new ErrorHandler("User ID not found in request", 401);
    }

    const order = await orderService.rejectOrder(
      orderId,
      rejectedBy,
      rejectionReason
    );

    const table = await tableService.getTableById(order.tableId);

    return ApiResponse.success(
      res,
      {
        orderId: order.orderId,
        tableId: order.tableId,
        tableNumber: table.tableNumber,
        status: order.status,
        rejectedAt: order.rejectedAt,
        rejectedBy: order.rejectedBy,
        rejectionReason: order.rejectionReason,
      },
      "Order rejected"
    );
  }
);

export const UpdateOrderStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(orderId, status);

    const table = await tableService.getTableById(order.tableId);

    return ApiResponse.success(
      res,
      {
        orderId: order.orderId,
        tableId: order.tableId,
        tableNumber: table.tableNumber,
        status: order.status,
        updatedAt: order.updatedAt,
      },
      `Order status updated to '${status}'`
    );
  }
);

export const MarkOrderInKitchen = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await orderService.updateOrderStatus(
      orderId,
      OrderStatusEnum.IN_KITCHEN
    );

    return ApiResponse.success(
      res,
      {
        orderId: order.orderId,
        tableId: order.tableId,
        status: order.status,
        inKitchenAt: order.inKitchenAt,
      },
      "Order is now being prepared"
    );
  }
);

export const MarkOrderReady = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await orderService.updateOrderStatus(
      orderId,
      OrderStatusEnum.READY
    );

    const table = await tableService.getTableById(order.tableId);

    return ApiResponse.success(
      res,
      {
        orderId: order.orderId,
        tableId: order.tableId,
        tableNumber: table.tableNumber,
        location: table.location,
        status: order.status,
        readyAt: order.readyAt,
      },
      `Order ready for table ${table.tableNumber}`
    );
  }
);

export const MarkOrderServed = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await orderService.updateOrderStatus(
      orderId,
      OrderStatusEnum.SERVED
    );

    return ApiResponse.success(
      res,
      {
        orderId: order.orderId,
        tableId: order.tableId,
        status: order.status,
        servedAt: order.servedAt,
      },
      "Order served"
    );
  }
);

export const CancelOrder = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { cancellationReason } = req.body;
    const cancelledBy = req.user?.userId;

    if (!cancelledBy) {
      throw new ErrorHandler("User ID not found in request", 401);
    }

    const order = await orderService.cancelOrder(
      orderId,
      cancelledBy,
      cancellationReason
    );

    return ApiResponse.success(
      res,
      {
        orderId: order.orderId,
        tableId: order.tableId,
        status: order.status,
        cancelledAt: order.cancelledAt,
        cancelledBy: order.cancelledBy,
        cancellationReason: order.cancellationReason,
      },
      "Order cancelled"
    );
  }
);

export const BulkUpdateOrderStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderIds, status } = req.body;

    const updated: string[] = [];
    const failed: { orderId: string; reason: string }[] = [];

    for (const orderId of orderIds) {
      try {
        await orderService.updateOrderStatus(orderId, status);
        updated.push(orderId);
      } catch (error) {
        failed.push({
          orderId,
          reason: (error as Error).message,
        });
      }
    }

    return ApiResponse.success(
      res,
      {
        requested: orderIds.length,
        updated: updated.length,
        failed: failed.length,
        status,
        updatedIds: updated,
        failures: failed,
      },
      `Successfully updated ${updated.length} order(s) to '${status}'`
    );
  }
);

export const GetOrderStats = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await orderService.getOrderStats();

    return ApiResponse.success(
      res,
      {
        total: stats.total,
        byStatus: {
          placed: stats.placed,
          accepted: stats.accepted,
          inKitchen: stats.inKitchen,
          ready: stats.ready,
          served: stats.served,
          rejected: stats.rejected,
          cancelled: stats.cancelled,
        },
        revenue: {
          total: stats.totalRevenue,
          averageOrderValue: stats.averageOrderValue,
        },
        percentages: {
          completionRate:
            stats.total > 0
              ? Math.round((stats.served / stats.total) * 100)
              : 0,
          rejectionRate:
            stats.total > 0
              ? Math.round((stats.rejected / stats.total) * 100)
              : 0,
          cancellationRate:
            stats.total > 0
              ? Math.round((stats.cancelled / stats.total) * 100)
              : 0,
        },
      },
      "Order statistics retrieved successfully"
    );
  }
);

export const GetOrdersByDateRange = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate, status, tableId } = req.query;

    if (!startDate || !endDate) {
      throw new ErrorHandler("Start date and end date are required", 400);
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ErrorHandler("Invalid date format", 400);
    }

    let orders = await orderService.getOrdersByDateRange(start, end);

    if (status && typeof status === "string") {
      orders = orders.filter((order) => order.status === status);
    }

    if (tableId && typeof tableId === "string") {
      orders = orders.filter(
        (order) => order.tableId.toUpperCase() === tableId.toUpperCase()
      );
    }

    return ApiResponse.success(
      res,
      {
        count: orders.length,
        dateRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        orders: orders.map((order) => ({
          orderId: order.orderId,
          tableId: order.tableId,
          sessionId: order.sessionId,
          itemsCount: order.items.length,
          status: order.status,
          totalAmount: order.totalAmount,
          placedAt: order.placedAt,
        })),
      },
      `Retrieved ${orders.length} order(s) in date range`
    );
  }
);

export const GetRevenueByDateRange = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ErrorHandler("Start date and end date are required", 400);
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ErrorHandler("Invalid date format", 400);
    }

    const revenue = await orderService.getRevenueByDateRange(start, end);

    return ApiResponse.success(
      res,
      {
        dateRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        revenue,
      },
      `Revenue for date range: PKR ${revenue}`
    );
  }
);

export const GetCustomerOrder = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;

    const order = await orderService.getOrderById(orderId);

    if (req.session && order.sessionId !== req.session.sessionId) {
      throw new ErrorHandler("Order does not belong to your session", 403);
    }

    return ApiResponse.success(
      res,
      {
        orderId: order.orderId,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations,
          subtotal: item.subtotal,
        })),
        status: order.status,
        specialInstructions: order.specialInstructions,
        estimatedTime: order.estimatedTime,
        totalAmount: order.totalAmount,
        placedAt: order.placedAt,
        acceptedAt: order.acceptedAt,
        readyAt: order.readyAt,
        servedAt: order.servedAt,
        rejectionReason: order.rejectionReason,
      },
      "Order retrieved successfully"
    );
  }
);

export const GetCustomerSessionOrders = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session) {
      throw new ErrorHandler("Session not found", 401);
    }

    const orders = await orderService.getOrdersBySession(req.session.sessionId);

    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    return ApiResponse.success(
      res,
      {
        sessionId: req.session.sessionId,
        ordersCount: orders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        orders: orders.map((order) => ({
          orderId: order.orderId,
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            subtotal: item.subtotal,
          })),
          status: order.status,
          totalAmount: order.totalAmount,
          placedAt: order.placedAt,
          estimatedTime: order.estimatedTime,
        })),
      },
      `Retrieved ${orders.length} order(s) for your session`
    );
  }
);
