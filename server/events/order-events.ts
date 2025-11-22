import { Server, Socket } from "socket.io";

import { OrderStatusEnum } from "../enums/models-enums.js";
import {
  OrderCreatedData,
  OrderItemsUpdatedData,
  OrderStatusChangedData,
} from "../types/events-interfaces.js";

import { getOrderStatusMessage } from "../utils/order-status-message.js";

export const OrderEvents = (io: Server, socket: Socket): void => {
  console.log(`📦 Order events registered for socket: ${socket.id}`);

  socket.on("order:created", async (data: OrderCreatedData) => {
    try {
      console.log(
        `📦 [order:created] Order ${data.orderId} placed at Table ${data.tableNumber}`
      );

      io.to("kitchen").emit("kitchen:new-order", {
        orderId: data.orderId,
        tableNumber: data.tableNumber,
        tableId: data.tableId,
        items: data.items,
        totalAmount: data.totalAmount,
        specialInstructions: data.specialInstructions,
        placedAt: data.placedAt,
        priority: "NORMAL",
        sound: true,
      });

      io.to("admin-dashboard").emit("dashboard:new-order", {
        orderId: data.orderId,
        tableNumber: data.tableNumber,
        totalAmount: data.totalAmount,
        placedAt: data.placedAt,
      });

      io.to(`session:${data.sessionId}`).emit("order:placed", {
        orderId: data.orderId,
        status: OrderStatusEnum.PLACED,
        message: "Your order has been placed successfully",
        estimatedTime: 20,
        placedAt: data.placedAt,
      });

      console.log(`✅ Order ${data.orderId} broadcast to kitchen and customer`);
    } catch (error: any) {
      console.error(`❌ Error broadcasting order:created:`, error.message);
      socket.emit("error", {
        event: "order:created",
        message: "Failed to broadcast order creation",
      });
    }
  });

  socket.on("order:status-changed", async (data: OrderStatusChangedData) => {
    try {
      console.log(
        `📦 [order:status-changed] Order ${data.orderId}: ${data.oldStatus} → ${data.newStatus}`
      );

      io.to(`session:${data.sessionId}`).emit("order:status-update", {
        orderId: data.orderId,
        status: data.newStatus,
        previousStatus: data.oldStatus,
        estimatedTime: data.estimatedTime,
        message: getOrderStatusMessage(data.newStatus),
        updatedAt: data.updatedAt,
      });

      if (data.newStatus === OrderStatusEnum.READY) {
        io.to(`session:${data.sessionId}`).emit("order:ready", {
          orderId: data.orderId,
          tableNumber: data.tableNumber,
          message: "Your order is ready! 🎉",
          sound: true,
          updatedAt: data.updatedAt,
        });

        io.to("staff").emit("table:order-ready", {
          tableNumber: data.tableNumber,
          tableId: data.tableId,
          orderId: data.orderId,
          message: `Order ready for Table ${data.tableNumber}`,
        });
      }

      io.to("admin-dashboard").emit("dashboard:order-status-changed", {
        orderId: data.orderId,
        status: data.newStatus,
        tableNumber: data.tableNumber,
        updatedAt: data.updatedAt,
      });

      io.to("kitchen-dashboard").emit("kitchen:queue-updated", {
        orderId: data.orderId,
        status: data.newStatus,
        timestamp: data.updatedAt,
      });

      console.log(`✅ Order status change broadcast to all parties`);
    } catch (error: any) {
      console.error(
        `❌ Error broadcasting order:status-changed:`,
        error.message
      );
      socket.emit("error", {
        event: "order:status-changed",
        message: "Failed to broadcast status change",
      });
    }
  });

  socket.on(
    "order:accepted",
    async (data: {
      orderId: string;
      sessionId: string;
      estimatedTime: number;
      acceptedBy: string;
      acceptedAt: string;
    }) => {
      try {
        console.log(
          `📦 [order:accepted] Order ${data.orderId} accepted by kitchen`
        );

        io.to(`session:${data.sessionId}`).emit("order:accepted", {
          orderId: data.orderId,
          status: OrderStatusEnum.ACCEPTED,
          estimatedTime: data.estimatedTime,
          message: `Your order has been accepted! Estimated time: ${data.estimatedTime} minutes`,
          acceptedAt: data.acceptedAt,
        });

        console.log(`✅ Order acceptance notified to customer`);
      } catch (error: any) {
        console.error(`❌ Error broadcasting order:accepted:`, error.message);
      }
    }
  );

  socket.on("order:items-unavailable", async (data: OrderItemsUpdatedData) => {
    try {
      console.log(
        `📦 [order:items-unavailable] Order ${data.orderId} has unavailable items`
      );

      socket.emit("order:items-unavailable", {
        orderId: data.orderId,
        unavailableItems: data.unavailableItems,
        message:
          data.message ||
          "Some items in your order are currently unavailable. Please update your order.",
      });

      io.to("kitchen").emit("kitchen:order-issue", {
        orderId: data.orderId,
        issue: "ITEMS_UNAVAILABLE",
        items: data.unavailableItems,
      });

      console.log(`✅ Item unavailability broadcast`);
    } catch (error: any) {
      console.error(
        `❌ Error broadcasting order:items-unavailable:`,
        error.message
      );
    }
  });

  socket.on(
    "order:rejected",
    async (data: {
      orderId: string;
      sessionId: string;
      tableNumber: number;
      reason: string;
      rejectedBy: string;
      rejectedAt: string;
    }) => {
      try {
        console.log(`📦 [order:rejected] Order ${data.orderId} rejected`);

        io.to(`session:${data.sessionId}`).emit("order:rejected", {
          orderId: data.orderId,
          reason: data.reason,
          message: `Your order has been rejected: ${data.reason}`,
          rejectedAt: data.rejectedAt,
        });

        io.to("admin-dashboard").emit("dashboard:order-rejected", {
          orderId: data.orderId,
          tableNumber: data.tableNumber,
          reason: data.reason,
          rejectedAt: data.rejectedAt,
        });

        console.log(`✅ Order rejection broadcast`);
      } catch (error: any) {
        console.error(`❌ Error broadcasting order:rejected:`, error.message);
      }
    }
  );

  socket.on(
    "order:cancelled",
    async (data: {
      orderId: string;
      sessionId: string;
      tableId: string;
      tableNumber: number;
      reason: string;
      cancelledBy: string;
      cancelledAt: string;
    }) => {
      try {
        console.log(`📦 [order:cancelled] Order ${data.orderId} cancelled`);

        io.to(`session:${data.sessionId}`).emit("order:cancelled", {
          orderId: data.orderId,
          reason: data.reason,
          message: "Your order has been cancelled",
          cancelledAt: data.cancelledAt,
        });

        io.to("kitchen").emit("kitchen:order-cancelled", {
          orderId: data.orderId,
          tableNumber: data.tableNumber,
          reason: data.reason,
        });

        io.to("admin-dashboard").emit("dashboard:order-cancelled", {
          orderId: data.orderId,
          tableNumber: data.tableNumber,
          cancelledAt: data.cancelledAt,
        });

        console.log(`✅ Order cancellation broadcast`);
      } catch (error: any) {
        console.error(`❌ Error broadcasting order:cancelled:`, error.message);
      }
    }
  );

  socket.on(
    "order:served",
    async (data: {
      orderId: string;
      sessionId: string;
      servedBy?: string;
      servedAt: string;
    }) => {
      try {
        console.log(`📦 [order:served] Order ${data.orderId} served`);

        io.to(`session:${data.sessionId}`).emit("order:served", {
          orderId: data.orderId,
          status: OrderStatusEnum.SERVED,
          message: "Enjoy your meal! 🍽️",
          servedAt: data.servedAt,
        });

        io.to("admin-dashboard").emit("dashboard:order-served", {
          orderId: data.orderId,
          servedAt: data.servedAt,
        });

        console.log(`✅ Order served notification broadcast`);
      } catch (error: any) {
        console.error(`❌ Error broadcasting order:served:`, error.message);
      }
    }
  );
};
