import { Server, Socket } from "socket.io";

import { OrderStatusEnum } from "../enums/models-enums.js";
import { KitchenStats } from "../types/events-interfaces.js";

export const KitchenEvents = (io: Server, socket: Socket): void => {
  console.log(`👨‍🍳 Kitchen events registered for socket: ${socket.id}`);

  socket.on("kitchen:get-orders", async () => {
    try {
      console.log(
        `👨‍🍳 [kitchen:get-orders] Kitchen dashboard requesting order queue`
      );

      socket.emit("kitchen:orders-requested", {
        message:
          "Fetch orders from API: GET /api/orders?status=PLACED,ACCEPTED,IN_KITCHEN,READY",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`❌ Error handling kitchen:get-orders:`, error.message);
      socket.emit("error", {
        event: "kitchen:get-orders",
        message: "Failed to fetch kitchen orders",
      });
    }
  });

  socket.on(
    "kitchen:order-accepted",
    async (data: {
      orderId: string;
      sessionId: string;
      estimatedTime: number;
      acceptedBy: string;
    }) => {
      try {
        console.log(
          `👨‍🍳 [kitchen:order-accepted] Order ${data.orderId} accepted`
        );

        io.to(`session:${data.sessionId}`).emit("order:accepted", {
          orderId: data.orderId,
          status: OrderStatusEnum.ACCEPTED,
          estimatedTime: data.estimatedTime,
          message: `Your order has been accepted! Estimated time: ${data.estimatedTime} minutes`,
          acceptedAt: new Date().toISOString(),
        });

        io.to("kitchen-dashboard").emit("kitchen:order-status-updated", {
          orderId: data.orderId,
          status: OrderStatusEnum.ACCEPTED,
          estimatedTime: data.estimatedTime,
          acceptedBy: data.acceptedBy,
        });

        io.to("admin-dashboard").emit("dashboard:order-accepted", {
          orderId: data.orderId,
          estimatedTime: data.estimatedTime,
          acceptedBy: data.acceptedBy,
        });

        console.log(`✅ Order acceptance broadcast from kitchen`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting kitchen:order-accepted:`,
          error.message
        );
        socket.emit("error", {
          event: "kitchen:order-accepted",
          message: "Failed to accept order",
        });
      }
    }
  );

  socket.on(
    "kitchen:order-ready",
    async (data: {
      orderId: string;
      sessionId: string;
      tableNumber: number;
      tableId: string;
      preparedBy: string;
    }) => {
      try {
        console.log(`👨‍🍳 [kitchen:order-ready] Order ${data.orderId} is ready`);

        io.to(`session:${data.sessionId}`).emit("order:ready", {
          orderId: data.orderId,
          status: OrderStatusEnum.READY,
          tableNumber: data.tableNumber,
          message: "Your order is ready! 🎉",
          sound: true,
          readyAt: new Date().toISOString(),
        });

        io.to("staff").emit("table:order-ready", {
          orderId: data.orderId,
          tableNumber: data.tableNumber,
          tableId: data.tableId,
          message: `Order ready for Table ${data.tableNumber}`,
          priority: "HIGH",
          sound: true,
        });

        io.to("kitchen-dashboard").emit("kitchen:order-completed", {
          orderId: data.orderId,
          preparedBy: data.preparedBy,
          completedAt: new Date().toISOString(),
        });

        io.to("admin-dashboard").emit("dashboard:order-ready", {
          orderId: data.orderId,
          tableNumber: data.tableNumber,
          readyAt: new Date().toISOString(),
        });

        console.log(`✅ Order ready notification broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting kitchen:order-ready:`,
          error.message
        );
        socket.emit("error", {
          event: "kitchen:order-ready",
          message: "Failed to mark order as ready",
        });
      }
    }
  );

  socket.on(
    "kitchen:item-unavailable",
    async (data: {
      itemId: string;
      itemName: string;
      reason: string;
      markedBy: string;
    }) => {
      try {
        console.log(
          `👨‍🍳 [kitchen:item-unavailable] Item ${data.itemName} marked as unavailable`
        );

        io.emit("menu:item-unavailable", {
          itemId: data.itemId,
          itemName: data.itemName,
          isAvailable: false,
          reason: data.reason,
          markedAt: new Date().toISOString(),
        });

        io.to("staff").emit("kitchen:item-86", {
          itemId: data.itemId,
          itemName: data.itemName,
          reason: data.reason,
          markedBy: data.markedBy,
          message: `${data.itemName} is now unavailable (86'd)`,
        });

        io.to("admin-dashboard").emit("dashboard:item-unavailable", {
          itemId: data.itemId,
          itemName: data.itemName,
          markedAt: new Date().toISOString(),
        });

        console.log(`✅ Item unavailability broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting kitchen:item-unavailable:`,
          error.message
        );
        socket.emit("error", {
          event: "kitchen:item-unavailable",
          message: "Failed to mark item unavailable",
        });
      }
    }
  );

  socket.on(
    "kitchen:item-available",
    async (data: { itemId: string; itemName: string; markedBy: string }) => {
      try {
        console.log(
          `👨‍🍳 [kitchen:item-available] Item ${data.itemName} marked as available`
        );

        io.emit("menu:item-available", {
          itemId: data.itemId,
          itemName: data.itemName,
          isAvailable: true,
          markedAt: new Date().toISOString(),
        });

        io.to("staff").emit("kitchen:item-restored", {
          itemId: data.itemId,
          itemName: data.itemName,
          markedBy: data.markedBy,
          message: `${data.itemName} is now available again`,
        });

        console.log(`✅ Item availability broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting kitchen:item-available:`,
          error.message
        );
        socket.emit("error", {
          event: "kitchen:item-available",
          message: "Failed to mark item available",
        });
      }
    }
  );

  socket.on("kitchen:request-stats", async () => {
    try {
      console.log(`👨‍🍳 [kitchen:request-stats] Stats requested`);

      socket.emit("kitchen:fetch-stats", {
        message: "Fetch kitchen stats from API: GET /api/orders/stats",
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error(`❌ Error handling kitchen:request-stats:`, error.message);
    }
  });

  socket.on("kitchen:stats-update", async (stats: KitchenStats) => {
    try {
      console.log(`👨‍🍳 [kitchen:stats-update] Broadcasting kitchen statistics`);

      io.to("kitchen-dashboard").emit("kitchen:stats-updated", stats);

      io.to("admin-dashboard").emit("dashboard:kitchen-stats", stats);

      console.log(`✅ Kitchen stats broadcast`);
    } catch (error: any) {
      console.error(
        `❌ Error broadcasting kitchen:stats-update:`,
        error.message
      );
    }
  });

  socket.on(
    "kitchen:order-delay",
    async (data: {
      orderId: string;
      sessionId: string;
      additionalTime: number;
      reason: string;
      reportedBy: string;
    }) => {
      try {
        console.log(
          `👨‍🍳 [kitchen:order-delay] Order ${data.orderId} delayed by ${data.additionalTime} minutes`
        );

        io.to(`session:${data.sessionId}`).emit("order:delay", {
          orderId: data.orderId,
          additionalTime: data.additionalTime,
          reason: data.reason,
          message: `We apologize, your order will take ${data.additionalTime} additional minutes. Reason: ${data.reason}`,
          timestamp: new Date().toISOString(),
        });

        io.to("admin-dashboard").emit("dashboard:order-delay", {
          orderId: data.orderId,
          additionalTime: data.additionalTime,
          reason: data.reason,
          reportedBy: data.reportedBy,
        });

        console.log(`✅ Order delay notification broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting kitchen:order-delay:`,
          error.message
        );
        socket.emit("error", {
          event: "kitchen:order-delay",
          message: "Failed to report order delay",
        });
      }
    }
  );

  socket.on(
    "kitchen:notification",
    async (data: {
      type: "INFO" | "WARNING" | "URGENT";
      title: string;
      message: string;
      from?: string;
    }) => {
      try {
        console.log(`👨‍🍳 [kitchen:notification] ${data.type}: ${data.title}`);

        io.to("kitchen").emit("kitchen:notification", {
          type: data.type,
          title: data.title,
          message: data.message,
          from: data.from,
          sound: data.type === "URGENT",
          timestamp: new Date().toISOString(),
        });

        if (data.type === "URGENT") {
          io.to("admin").emit("admin:urgent-notification", {
            source: "kitchen",
            title: data.title,
            message: data.message,
            timestamp: new Date().toISOString(),
          });
        }

        console.log(`✅ Kitchen notification broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting kitchen:notification:`,
          error.message
        );
      }
    }
  );

  socket.on("kitchen:refresh-queue", async () => {
    try {
      console.log(`👨‍🍳 [kitchen:refresh-queue] Queue refresh requested`);

      io.to("kitchen-dashboard").emit("kitchen:queue-refresh", {
        message: "Refreshing order queue...",
        timestamp: new Date().toISOString(),
      });

      console.log(`✅ Kitchen queue refresh triggered`);
    } catch (error: any) {
      console.error(`❌ Error handling kitchen:refresh-queue:`, error.message);
    }
  });
};
