import { Server, Socket } from "socket.io";

import { TableStatusEnum } from "../enums/models-enums.js";
import {
  SessionCreatedData,
  SessionEndedData,
  TableStatusChangedData,
} from "../types/events-interfaces.js";

import { getAttentionMessage } from "../utils/attention-message.js";
import { getTableStatusMessage } from "../utils/table-status-message.js";

export const TableEvents = (io: Server, socket: Socket): void => {
  console.log(`🪑 Table events registered for socket: ${socket.id}`);

  socket.on("table:session-started", async (data: SessionCreatedData) => {
    try {
      console.log(
        `🪑 [table:session-started] Session ${data.sessionId} started at Table ${data.tableNumber}`
      );

      io.to("admin-dashboard").emit("dashboard:session-started", {
        sessionId: data.sessionId,
        tableNumber: data.tableNumber,
        location: data.location,
        expiresAt: data.expiresAt,
        createdAt: data.createdAt,
      });

      io.to("receptionist").emit("receptionist:session-created", {
        sessionId: data.sessionId,
        tableNumber: data.tableNumber,
        securityCode: data.securityCode,
        expiresAt: data.expiresAt,
        message: `Security code for Table ${data.tableNumber}: ${data.securityCode}`,
        sound: true,
      });

      io.to("admin-dashboard").emit("table:status-changed", {
        tableId: data.tableId,
        tableNumber: data.tableNumber,
        status: TableStatusEnum.OCCUPIED,
        sessionId: data.sessionId,
        timestamp: data.createdAt,
      });

      io.to("staff").emit("table:occupied", {
        tableNumber: data.tableNumber,
        location: data.location,
        sessionId: data.sessionId,
      });

      console.log(`✅ Session start broadcast to all parties`);
    } catch (error: any) {
      console.error(
        `❌ Error broadcasting table:session-started:`,
        error.message
      );
      socket.emit("error", {
        event: "table:session-started",
        message: "Failed to broadcast session start",
      });
    }
  });

  socket.on("table:session-ended", async (data: SessionEndedData) => {
    try {
      console.log(
        `🪑 [table:session-ended] Session ${data.sessionId} ended at Table ${data.tableNumber}`
      );

      io.to("admin-dashboard").emit("dashboard:session-ended", {
        sessionId: data.sessionId,
        tableNumber: data.tableNumber,
        duration: data.duration,
        endedAt: data.endedAt,
        reason: data.reason,
      });

      io.to("admin-dashboard").emit("table:status-changed", {
        tableId: data.tableId,
        tableNumber: data.tableNumber,
        status: TableStatusEnum.AVAILABLE,
        timestamp: data.endedAt,
      });

      io.to("staff").emit("table:available", {
        tableNumber: data.tableNumber,
        tableId: data.tableId,
        message: `Table ${data.tableNumber} is now available`,
        endedAt: data.endedAt,
      });

      io.to("receptionist").emit("receptionist:table-available", {
        tableNumber: data.tableNumber,
        duration: data.duration,
      });

      console.log(`✅ Session end broadcast`);
    } catch (error: any) {
      console.error(
        `❌ Error broadcasting table:session-ended:`,
        error.message
      );
      socket.emit("error", {
        event: "table:session-ended",
        message: "Failed to broadcast session end",
      });
    }
  });

  socket.on("table:status-changed", async (data: TableStatusChangedData) => {
    try {
      console.log(
        `🪑 [table:status-changed] Table ${data.tableNumber}: ${data.oldStatus} → ${data.newStatus}`
      );

      io.to("admin-dashboard").emit("table:status-updated", {
        tableId: data.tableId,
        tableNumber: data.tableNumber,
        oldStatus: data.oldStatus,
        newStatus: data.newStatus,
        reason: data.reason,
        timestamp: data.changedAt,
      });

      io.to("staff").emit("table:status-update", {
        tableNumber: data.tableNumber,
        status: data.newStatus,
        message: getTableStatusMessage(data.tableNumber, data.newStatus),
        timestamp: data.changedAt,
      });

      if (data.newStatus === TableStatusEnum.MAINTENANCE) {
        io.to("staff").emit("table:needs-maintenance", {
          tableNumber: data.tableNumber,
          tableId: data.tableId,
          priority: "NORMAL",
          sound: true,
        });
      }

      console.log(`✅ Table status change broadcast`);
    } catch (error: any) {
      console.error(
        `❌ Error broadcasting table:status-changed:`,
        error.message
      );
      socket.emit("error", {
        event: "table:status-changed",
        message: "Failed to broadcast table status change",
      });
    }
  });

  socket.on(
    "table:requires-attention",
    async (data: {
      tableId: string;
      tableNumber: number;
      sessionId: string;
      reason: "ASSISTANCE" | "REFILL" | "COMPLAINT" | "PAYMENT" | "OTHER";
      note?: string;
    }) => {
      try {
        console.log(
          `🪑 [table:requires-attention] Table ${data.tableNumber} needs attention: ${data.reason}`
        );

        io.to("staff").emit("table:assistance-needed", {
          tableNumber: data.tableNumber,
          tableId: data.tableId,
          sessionId: data.sessionId,
          reason: data.reason,
          note: data.note,
          message: getAttentionMessage(data.tableNumber, data.reason),
          priority: data.reason === "COMPLAINT" ? "URGENT" : "HIGH",
          sound: true,
          timestamp: new Date().toISOString(),
        });

        io.to("admin-dashboard").emit("dashboard:table-alert", {
          tableNumber: data.tableNumber,
          reason: data.reason,
          timestamp: new Date().toISOString(),
        });

        io.to(`session:${data.sessionId}`).emit(
          "table:assistance-acknowledged",
          {
            message: "Staff has been notified and will assist you shortly",
            timestamp: new Date().toISOString(),
          }
        );

        console.log(`✅ Table assistance alert broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting table:requires-attention:`,
          error.message
        );
        socket.emit("error", {
          event: "table:requires-attention",
          message: "Failed to request assistance",
        });
      }
    }
  );

  socket.on(
    "table:assistance-resolved",
    async (data: {
      tableId: string;
      tableNumber: number;
      sessionId: string;
      resolvedBy: string;
      resolvedAt: string;
    }) => {
      try {
        console.log(
          `🪑 [table:assistance-resolved] Table ${data.tableNumber} assistance resolved`
        );

        io.to(`session:${data.sessionId}`).emit("table:assistance-completed", {
          message: "Your request has been handled. Thank you!",
          resolvedAt: data.resolvedAt,
        });

        io.to("admin-dashboard").emit("dashboard:alert-resolved", {
          tableNumber: data.tableNumber,
          resolvedBy: data.resolvedBy,
          resolvedAt: data.resolvedAt,
        });

        console.log(`✅ Assistance resolution broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting table:assistance-resolved:`,
          error.message
        );
      }
    }
  );

  socket.on(
    "table:session-transferred",
    async (data: {
      sessionId: string;
      oldTableId: string;
      oldTableNumber: number;
      newTableId: string;
      newTableNumber: number;
      reason: string;
      transferredBy: string;
      transferredAt: string;
    }) => {
      try {
        console.log(
          `🪑 [table:session-transferred] Session moved from Table ${data.oldTableNumber} to ${data.newTableNumber}`
        );

        io.to(`session:${data.sessionId}`).emit("session:transferred", {
          oldTableNumber: data.oldTableNumber,
          newTableNumber: data.newTableNumber,
          reason: data.reason,
          message: `Your session has been moved from Table ${data.oldTableNumber} to Table ${data.newTableNumber}`,
          transferredAt: data.transferredAt,
        });

        io.to("staff").emit("table:transfer-completed", {
          sessionId: data.sessionId,
          oldTableNumber: data.oldTableNumber,
          newTableNumber: data.newTableNumber,
          transferredBy: data.transferredBy,
        });

        io.to("admin-dashboard").emit("dashboard:session-transferred", {
          sessionId: data.sessionId,
          oldTableNumber: data.oldTableNumber,
          newTableNumber: data.newTableNumber,
          transferredAt: data.transferredAt,
        });

        io.to("admin-dashboard").emit("table:status-changed", {
          tableId: data.oldTableId,
          tableNumber: data.oldTableNumber,
          status: TableStatusEnum.AVAILABLE,
          timestamp: data.transferredAt,
        });

        io.to("admin-dashboard").emit("table:status-changed", {
          tableId: data.newTableId,
          tableNumber: data.newTableNumber,
          status: TableStatusEnum.OCCUPIED,
          timestamp: data.transferredAt,
        });

        console.log(`✅ Session transfer broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting table:session-transferred:`,
          error.message
        );
        socket.emit("error", {
          event: "table:session-transferred",
          message: "Failed to broadcast session transfer",
        });
      }
    }
  );

  socket.on(
    "table:reservation-created",
    async (data: {
      tableId: string;
      tableNumber: number;
      reservedFor: string;
      reservedBy: string;
      reservationTime: string;
      partySize: number;
    }) => {
      try {
        console.log(
          `🪑 [table:reservation-created] Table ${data.tableNumber} reserved for ${data.reservedFor}`
        );

        io.to("receptionist").emit("receptionist:reservation-created", {
          tableNumber: data.tableNumber,
          reservedFor: data.reservedFor,
          reservationTime: data.reservationTime,
          partySize: data.partySize,
        });

        io.to("admin-dashboard").emit("table:status-changed", {
          tableId: data.tableId,
          tableNumber: data.tableNumber,
          status: TableStatusEnum.RESERVED,
          timestamp: new Date().toISOString(),
        });

        console.log(`✅ Table reservation broadcast`);
      } catch (error: any) {
        console.error(
          `❌ Error broadcasting table:reservation-created:`,
          error.message
        );
      }
    }
  );
};
