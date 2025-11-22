import { Server, Socket } from "socket.io";

import {
  AlertNotification,
  GeneralNotification,
} from "../types/events-interfaces.js";

export const NotificationEvents = (io: Server, socket: Socket): void => {
  console.log(`🔔 Notification events registered for socket: ${socket.id}`);

  socket.on("notification:general", async (data: GeneralNotification) => {
    try {
      console.log(`🔔 [notification:general] ${data.type}: ${data.title}`);

      const notification = {
        type: data.type,
        title: data.title,
        message: data.message,
        sound: data.sound || false,
        actions: data.actions,
        expiresAt: data.expiresAt,
        timestamp: new Date().toISOString(),
      };

      switch (data.target) {
        case "customer":
          io.emit("customer:notification", notification);
          break;

        case "staff":
          io.to("staff").emit("staff:notification", notification);
          break;

        case "kitchen":
          io.to("kitchen").emit("kitchen:notification", notification);
          break;

        case "admin":
          io.to("admin").emit("admin:notification", notification);
          break;

        case "all":
          io.emit("notification", notification);
          break;

        default:
          socket.emit("error", { message: "Invalid notification target" });
          return;
      }

      console.log(`✅ General notification broadcast to ${data.target}`);
    } catch (error: any) {
      console.error(
        `❌ Error broadcasting notification:general:`,
        error.message
      );
      socket.emit("error", {
        event: "notification:general",
        message: "Failed to broadcast notification",
      });
    }
  });

  socket.on("notification:alert", async (data: AlertNotification) => {
    try {
      console.log(
        `🔔 [notification:alert] ${data.severity} - ${data.category}: ${data.title}`
      );

      const alert = {
        severity: data.severity,
        category: data.category,
        title: data.title,
        message: data.message,
        affectedArea: data.affectedArea,
        actionRequired: data.actionRequired || false,
        assignedTo: data.assignedTo,
        sound: data.severity === "HIGH" || data.severity === "CRITICAL",
        timestamp: new Date().toISOString(),
      };

      io.to("admin").emit("admin:alert", alert);

      if (
        data.category === "OPERATIONAL" ||
        data.category === "CUSTOMER_SERVICE"
      ) {
        io.to("staff").emit("staff:alert", alert);
      }

      if (data.severity === "CRITICAL") {
        io.emit("critical:alert", {
          ...alert,
          priority: "IMMEDIATE",
          requiresAcknowledgment: true,
        });
      }

      console.log(`✅ Alert broadcast`);
    } catch (error: any) {
      console.error(`❌ Error broadcasting notification:alert:`, error.message);
      socket.emit("error", {
        event: "notification:alert",
        message: "Failed to broadcast alert",
      });
    }
  });

  socket.on(
    "notification:broadcast",
    async (data: {
      title: string;
      message: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
      broadcastBy: string;
      duration?: number;
    }) => {
      try {
        console.log(
          `🔔 [notification:broadcast] Admin broadcast: ${data.title}`
        );

        io.emit("system:broadcast", {
          title: data.title,
          message: data.message,
          priority: data.priority,
          broadcastBy: data.broadcastBy,
          duration: data.duration || 10,
          sound: data.priority === "HIGH",
          timestamp: new Date().toISOString(),
        });

        io.to("admin-dashboard").emit("dashboard:broadcast-sent", {
          title: data.title,
          broadcastBy: data.broadcastBy,
          timestamp: new Date().toISOString(),
        });

        console.log(`✅ System broadcast sent`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting notification:broadcast:`,
          error.message
        );
        socket.emit("error", {
          event: "notification:broadcast",
          message: "Failed to broadcast message",
        });
      }
    }
  );

  socket.on(
    "notification:customer-feedback",
    async (data: {
      sessionId: string;
      tableNumber: number;
      rating: number;
      category: "FOOD" | "SERVICE" | "AMBIANCE" | "OVERALL";
      comment?: string;
      submittedAt: string;
    }) => {
      try {
        console.log(
          `🔔 [notification:customer-feedback] Table ${data.tableNumber} rated ${data.category}: ${data.rating}/5`
        );

        io.to("admin").emit("admin:customer-feedback", {
          sessionId: data.sessionId,
          tableNumber: data.tableNumber,
          rating: data.rating,
          category: data.category,
          comment: data.comment,
          submittedAt: data.submittedAt,
        });

        if (data.rating <= 2) {
          io.to("admin").emit("admin:low-rating-alert", {
            tableNumber: data.tableNumber,
            rating: data.rating,
            category: data.category,
            comment: data.comment,
            message: `⚠️ Low rating (${data.rating}/5) from Table ${data.tableNumber}`,
            priority: "HIGH",
            sound: true,
          });

          io.to("staff").emit("staff:customer-issue", {
            tableNumber: data.tableNumber,
            message: `Customer at Table ${data.tableNumber} may need assistance`,
            priority: "HIGH",
          });
        }

        socket.emit("feedback:received", {
          message: "Thank you for your feedback!",
          timestamp: new Date().toISOString(),
        });

        console.log(`✅ Customer feedback processed`);
      } catch (error: any) {
        console.error(
          `❌ Error processing notification:customer-feedback:`,
          error.message
        );
      }
    }
  );

  socket.on(
    "notification:system-status",
    async (data: {
      component: string;
      status: "HEALTHY" | "DEGRADED" | "DOWN";
      message: string;
      details?: any;
    }) => {
      try {
        console.log(
          `🔔 [notification:system-status] ${data.component}: ${data.status}`
        );

        io.to("admin").emit("admin:system-status", {
          component: data.component,
          status: data.status,
          message: data.message,
          details: data.details,
          timestamp: new Date().toISOString(),
        });

        if (data.status === "DOWN") {
          io.to("admin-dashboard").emit("dashboard:system-alert", {
            component: data.component,
            status: data.status,
            message: data.message,
            severity: "CRITICAL",
            sound: true,
            timestamp: new Date().toISOString(),
          });
        }

        console.log(`✅ System status update sent`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting notification:system-status:`,
          error.message
        );
      }
    }
  );

  socket.on(
    "notification:marketing",
    async (data: {
      title: string;
      message: string;
      offerCode?: string;
      discountPercentage?: number;
      validUntil?: string;
      imageUrl?: string;
    }) => {
      try {
        console.log(`🔔 [notification:marketing] ${data.title}`);

        io.emit("customer:promotion", {
          title: data.title,
          message: data.message,
          offerCode: data.offerCode,
          discountPercentage: data.discountPercentage,
          validUntil: data.validUntil,
          imageUrl: data.imageUrl,
          timestamp: new Date().toISOString(),
        });

        console.log(`✅ Marketing notification sent to customers`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting notification:marketing:`,
          error.message
        );
      }
    }
  );

  socket.on(
    "notification:staff-message",
    async (data: {
      from: string;
      fromName: string;
      to?: string;
      message: string;
      priority: "NORMAL" | "URGENT";
    }) => {
      try {
        console.log(
          `🔔 [notification:staff-message] From ${data.fromName} to ${
            data.to || "all staff"
          }`
        );

        const staffMessage = {
          from: data.from,
          fromName: data.fromName,
          message: data.message,
          priority: data.priority,
          sound: data.priority === "URGENT",
          timestamp: new Date().toISOString(),
        };

        if (data.to) {
          io.to("staff").emit("staff:direct-message", {
            ...staffMessage,
            recipient: data.to,
          });
        } else {
          io.to("staff").emit("staff:message", staffMessage);
        }

        console.log(`✅ Staff message delivered`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting notification:staff-message:`,
          error.message
        );
      }
    }
  );

  socket.on(
    "notification:acknowledge",
    async (data: {
      notificationId: string;
      acknowledgedBy: string;
      acknowledgedAt: string;
    }) => {
      try {
        console.log(
          `🔔 [notification:acknowledge] Notification ${data.notificationId} acknowledged`
        );

        io.to("admin-dashboard").emit("dashboard:notification-acknowledged", {
          notificationId: data.notificationId,
          acknowledgedBy: data.acknowledgedBy,
          acknowledgedAt: data.acknowledgedAt,
        });

        console.log(`✅ Notification acknowledgment logged`);
      } catch (error: any) {
        console.error(
          `❌ Error processing notification:acknowledge:`,
          error.message
        );
      }
    }
  );

  socket.on(
    "notification:emergency",
    async (data: {
      type: "SECURITY" | "FIRE" | "MEDICAL" | "EVACUATION";
      message: string;
      location: string;
      triggeredBy: string;
    }) => {
      try {
        console.log(
          `🚨 [notification:emergency] EMERGENCY: ${data.type} at ${data.location}`
        );

        io.emit("emergency:alert", {
          type: data.type,
          message: data.message,
          location: data.location,
          triggeredBy: data.triggeredBy,
          priority: "CRITICAL",
          sound: true,
          vibrate: true,
          fullscreen: true,
          timestamp: new Date().toISOString(),
        });

        console.log(`🚨 Emergency alert broadcast to all clients`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting notification:emergency:`,
          error.message
        );
      }
    }
  );

  socket.on(
    "notification:daily-summary",
    async (data: {
      date: string;
      totalRevenue: number;
      totalOrders: number;
      totalCustomers: number;
      averageOrderValue: number;
      topSellingItems: Array<{ name: string; quantity: number }>;
    }) => {
      try {
        console.log(`🔔 [notification:daily-summary] Summary for ${data.date}`);

        io.to("admin").emit("admin:daily-summary", {
          ...data,
          timestamp: new Date().toISOString(),
        });

        console.log(`✅ Daily summary sent to admin`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting notification:daily-summary:`,
          error.message
        );
      }
    }
  );
};
