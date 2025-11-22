import { Server, Socket } from "socket.io";

import { BillStatusEnum, PaymentStatusEnum } from "../enums/models-enums.js";
import {
  BillGeneratedData,
  BillUpdatedData,
  PaymentCompletedData,
  PaymentInitiatedData,
} from "../types/events-interfaces.js";

export const BillEvents = (io: Server, socket: Socket): void => {
  console.log(`💰 Bill events registered for socket: ${socket.id}`);

  socket.on("bill:generated", async (data: BillGeneratedData) => {
    try {
      console.log(
        `💰 [bill:generated] Bill ${data.billId} generated for Table ${data.tableNumber}`
      );

      io.to(`session:${data.sessionId}`).emit("bill:ready", {
        billId: data.billId,
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount,
        tip: data.tip,
        total: data.total,
        message: "Your bill is ready",
        generatedAt: data.generatedAt,
      });

      io.to("staff").emit("bill:created", {
        billId: data.billId,
        tableNumber: data.tableNumber,
        total: data.total,
        generatedAt: data.generatedAt,
      });

      io.to("admin-dashboard").emit("dashboard:bill-generated", {
        billId: data.billId,
        tableNumber: data.tableNumber,
        total: data.total,
        generatedAt: data.generatedAt,
      });

      console.log(`✅ Bill generation broadcast`);
    } catch (error: any) {
      console.error(`❌ Error broadcasting bill:generated:`, error.message);
      socket.emit("error", {
        event: "bill:generated",
        message: "Failed to broadcast bill generation",
      });
    }
  });

  socket.on("bill:updated", async (data: BillUpdatedData) => {
    try {
      console.log(
        `💰 [bill:updated] Bill ${data.billId} updated - New total: ${data.total}`
      );

      io.to(`session:${data.sessionId}`).emit("bill:updated", {
        billId: data.billId,
        subtotal: data.subtotal,
        tax: data.tax,
        discount: data.discount,
        tip: data.tip,
        total: data.total,
        reason: data.reason,
        message: "Your bill has been updated",
        updatedAt: data.updatedAt,
      });

      io.to(`bill:${data.billId}`).emit("bill:changes", {
        billId: data.billId,
        total: data.total,
        updatedAt: data.updatedAt,
      });

      io.to("admin-dashboard").emit("dashboard:bill-updated", {
        billId: data.billId,
        tableNumber: data.tableNumber,
        total: data.total,
        updatedAt: data.updatedAt,
      });

      console.log(`✅ Bill update broadcast`);
    } catch (error: any) {
      console.error(`❌ Error broadcasting bill:updated:`, error.message);
      socket.emit("error", {
        event: "bill:updated",
        message: "Failed to broadcast bill update",
      });
    }
  });

  socket.on("bill:payment-initiated", async (data: PaymentInitiatedData) => {
    try {
      console.log(
        `💰 [bill:payment-initiated] Payment ${data.paymentId} initiated for Bill ${data.billId}`
      );

      io.to(`session:${data.sessionId}`).emit("payment:initiated", {
        paymentId: data.paymentId,
        billId: data.billId,
        amount: data.amount,
        method: data.method,
        status: PaymentStatusEnum.PENDING,
        message: "Payment initiated. Please complete the payment.",
        initiatedAt: data.initiatedAt,
      });

      io.to("staff").emit("table:payment-started", {
        tableNumber: data.tableNumber,
        billId: data.billId,
        amount: data.amount,
        method: data.method,
      });

      io.to("admin-dashboard").emit("dashboard:payment-initiated", {
        paymentId: data.paymentId,
        billId: data.billId,
        tableNumber: data.tableNumber,
        amount: data.amount,
        method: data.method,
        initiatedAt: data.initiatedAt,
      });

      console.log(`✅ Payment initiation broadcast`);
    } catch (error: any) {
      console.error(
        `❌ Error broadcasting bill:payment-initiated:`,
        error.message
      );
      socket.emit("error", {
        event: "bill:payment-initiated",
        message: "Failed to broadcast payment initiation",
      });
    }
  });

  socket.on("bill:payment-received", async (data: PaymentCompletedData) => {
    try {
      console.log(
        `💰 [bill:payment-received] Payment ${data.paymentId} completed for Bill ${data.billId}`
      );

      io.to(`session:${data.sessionId}`).emit("payment:completed", {
        paymentId: data.paymentId,
        billId: data.billId,
        amount: data.amount,
        method: data.method,
        transactionId: data.transactionId,
        status: PaymentStatusEnum.SUCCEEDED,
        message: "Payment successful! Thank you for dining with us. 🎉",
        sound: true,
        paidAt: data.paidAt,
      });

      io.to(`bill:${data.billId}`).emit("bill:paid", {
        billId: data.billId,
        status: BillStatusEnum.PAID,
        paidAt: data.paidAt,
      });

      io.to("staff").emit("table:payment-completed", {
        tableNumber: data.tableNumber,
        billId: data.billId,
        amount: data.amount,
        message: `Payment received for Table ${data.tableNumber}`,
        sound: true,
      });

      io.to("admin-dashboard").emit("dashboard:payment-completed", {
        paymentId: data.paymentId,
        billId: data.billId,
        tableNumber: data.tableNumber,
        amount: data.amount,
        method: data.method,
        paidAt: data.paidAt,
      });

      console.log(`✅ Payment completion broadcast`);
    } catch (error: any) {
      console.error(
        `❌ Error broadcasting bill:payment-received:`,
        error.message
      );
      socket.emit("error", {
        event: "bill:payment-received",
        message: "Failed to broadcast payment completion",
      });
    }
  });

  socket.on(
    "bill:payment-failed",
    async (data: {
      billId: string;
      paymentId: string;
      sessionId: string;
      tableNumber: number;
      amount: number;
      method: string;
      reason: string;
      failedAt: string;
    }) => {
      try {
        console.log(
          `💰 [bill:payment-failed] Payment ${data.paymentId} failed for Bill ${data.billId}`
        );

        io.to(`session:${data.sessionId}`).emit("payment:failed", {
          paymentId: data.paymentId,
          billId: data.billId,
          status: PaymentStatusEnum.FAILED,
          reason: data.reason,
          message: `Payment failed: ${data.reason}. Please try again or choose a different payment method.`,
          failedAt: data.failedAt,
        });

        io.to("staff").emit("table:payment-failed", {
          tableNumber: data.tableNumber,
          billId: data.billId,
          reason: data.reason,
          message: `Payment failed for Table ${data.tableNumber}`,
        });

        io.to("admin-dashboard").emit("dashboard:payment-failed", {
          paymentId: data.paymentId,
          billId: data.billId,
          tableNumber: data.tableNumber,
          reason: data.reason,
          failedAt: data.failedAt,
        });

        console.log(`✅ Payment failure broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting bill:payment-failed:`,
          error.message
        );
        socket.emit("error", {
          event: "bill:payment-failed",
          message: "Failed to broadcast payment failure",
        });
      }
    }
  );

  socket.on(
    "bill:split-requested",
    async (data: {
      billId: string;
      sessionId: string;
      tableNumber: number;
      splitCount: number;
      requestedBy?: string;
      requestedAt: string;
    }) => {
      try {
        console.log(
          `💰 [bill:split-requested] Table ${data.tableNumber} requests bill split into ${data.splitCount}`
        );

        io.to("staff").emit("bill:split-request", {
          billId: data.billId,
          tableNumber: data.tableNumber,
          splitCount: data.splitCount,
          message: `Table ${data.tableNumber} wants to split bill ${data.splitCount} ways`,
          priority: "HIGH",
          sound: true,
        });

        io.to(`session:${data.sessionId}`).emit("bill:split-acknowledged", {
          billId: data.billId,
          splitCount: data.splitCount,
          message: "Staff will assist you with splitting the bill shortly",
          requestedAt: data.requestedAt,
        });

        io.to("admin-dashboard").emit("dashboard:split-request", {
          billId: data.billId,
          tableNumber: data.tableNumber,
          splitCount: data.splitCount,
          requestedAt: data.requestedAt,
        });

        console.log(`✅ Bill split request broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting bill:split-requested:`,
          error.message
        );
        socket.emit("error", {
          event: "bill:split-requested",
          message: "Failed to request bill split",
        });
      }
    }
  );

  socket.on(
    "bill:discount-applied",
    async (data: {
      billId: string;
      sessionId: string;
      tableNumber: number;
      discountAmount: number;
      discountPercentage: number;
      reason: string;
      appliedBy: string;
      newTotal: number;
      appliedAt: string;
    }) => {
      try {
        console.log(
          `💰 [bill:discount-applied] ${data.discountPercentage}% discount applied to Bill ${data.billId}`
        );

        io.to(`session:${data.sessionId}`).emit("bill:discount-applied", {
          billId: data.billId,
          discountAmount: data.discountAmount,
          discountPercentage: data.discountPercentage,
          reason: data.reason,
          newTotal: data.newTotal,
          message: `A ${data.discountPercentage}% discount has been applied to your bill!`,
          appliedAt: data.appliedAt,
        });

        io.to("staff").emit("bill:discount-notification", {
          billId: data.billId,
          tableNumber: data.tableNumber,
          discountPercentage: data.discountPercentage,
          appliedBy: data.appliedBy,
        });

        io.to("admin-dashboard").emit("dashboard:discount-applied", {
          billId: data.billId,
          tableNumber: data.tableNumber,
          discountAmount: data.discountAmount,
          appliedBy: data.appliedBy,
          appliedAt: data.appliedAt,
        });

        console.log(`✅ Discount application broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting bill:discount-applied:`,
          error.message
        );
        socket.emit("error", {
          event: "bill:discount-applied",
          message: "Failed to broadcast discount application",
        });
      }
    }
  );

  socket.on(
    "bill:tip-added",
    async (data: {
      billId: string;
      sessionId: string;
      tableNumber: number;
      tipAmount: number;
      tipPercentage: number;
      newTotal: number;
      addedAt: string;
    }) => {
      try {
        console.log(
          `💰 [bill:tip-added] ${data.tipPercentage}% tip added to Bill ${data.billId}`
        );

        io.to(`session:${data.sessionId}`).emit("bill:tip-confirmed", {
          billId: data.billId,
          tipAmount: data.tipAmount,
          newTotal: data.newTotal,
          message: "Thank you for your generosity!",
          addedAt: data.addedAt,
        });

        io.to("staff").emit("table:tip-received", {
          tableNumber: data.tableNumber,
          tipAmount: data.tipAmount,
          tipPercentage: data.tipPercentage,
          message: `Table ${data.tableNumber} added ${data.tipPercentage}% tip`,
        });

        io.to("admin-dashboard").emit("dashboard:tip-added", {
          billId: data.billId,
          tableNumber: data.tableNumber,
          tipAmount: data.tipAmount,
          addedAt: data.addedAt,
        });

        console.log(`✅ Tip addition broadcast`);
      } catch (error: any) {
        console.error(`❌ Error broadcasting bill:tip-added:`, error.message);
      }
    }
  );

  socket.on(
    "bill:refund-requested",
    async (data: {
      billId: string;
      paymentId: string;
      tableNumber: number;
      amount: number;
      reason: string;
      requestedBy: string;
      requestedAt: string;
    }) => {
      try {
        console.log(
          `💰 [bill:refund-requested] Refund requested for Bill ${data.billId}`
        );

        io.to("admin").emit("admin:refund-request", {
          billId: data.billId,
          paymentId: data.paymentId,
          tableNumber: data.tableNumber,
          amount: data.amount,
          reason: data.reason,
          requestedBy: data.requestedBy,
          message: `Refund request for Table ${data.tableNumber}: ${data.reason}`,
          priority: "URGENT",
          sound: true,
          requestedAt: data.requestedAt,
        });

        console.log(`✅ Refund request sent to admin`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting bill:refund-requested:`,
          error.message
        );
        socket.emit("error", {
          event: "bill:refund-requested",
          message: "Failed to request refund",
        });
      }
    }
  );
};
