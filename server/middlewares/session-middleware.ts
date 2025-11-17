import { Request, Response, NextFunction } from "express";

import { TableStatusEnum } from "../enums/models-enums.js";

import { tableSessionService } from "../services/table-session-service.js";
import { tableService } from "../services/table-service.js";

import { ErrorHandler } from "../utils/error-handler.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";

// VERIFY TABLE SESSION EXISTS AND IS ACTIVE
export const VerifyActiveSession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session) {
      throw new ErrorHandler(
        "Session not found. Please scan QR code and verify security code.",
        401
      );
    }

    if (!req.session.isActive) {
      throw new ErrorHandler(
        "Session has ended. Please start a new session.",
        401
      );
    }

    if (!req.session.isVerified) {
      throw new ErrorHandler(
        "Session not verified. Please enter the security code provided by staff.",
        403
      );
    }

    if (tableSessionService.isSessionExpired(req.session)) {
      throw new ErrorHandler(
        "Session has expired (2 hours). Please scan QR code again.",
        401
      );
    }

    next();
  }
);

// VERIFY TABLE IS ACCESSIBLE (NOT IN MAINTENANCE)
export const VerifyTableAccess = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session) {
      throw new ErrorHandler("Session required to access table.", 401);
    }

    const table = await tableService.getTableById(req.session.tableId);

    if (table.status === TableStatusEnum.MAINTENANCE) {
      throw new ErrorHandler(
        "This table is currently under maintenance. Please contact staff.",
        403
      );
    }

    next();
  }
);

// VERIFY SESSION MATCHES TABLE ID IN REQUEST
export const VerifySessionMatchesTable = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session) {
      throw new ErrorHandler("Session required.", 401);
    }

    const requestTableId = (
      req.params.tableId ||
      req.body.tableId ||
      req.query.tableId
    )?.toUpperCase();

    if (!requestTableId) {
      throw new ErrorHandler("Table ID not provided in request.", 400);
    }

    if (req.session.tableId !== requestTableId) {
      throw new ErrorHandler(
        "Session does not match requested table. Possible security violation.",
        403
      );
    }

    next();
  }
);

// CHECK IF SESSION CAN PLACE ORDERS (TABLE OCCUPIED)
export const VerifyCanPlaceOrder = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session) {
      throw new ErrorHandler("Session required to place orders.", 401);
    }

    const table = await tableService.getTableById(req.session.tableId);

    if (
      table.status !== TableStatusEnum.OCCUPIED &&
      table.status !== TableStatusEnum.RESERVED
    ) {
      throw new ErrorHandler(
        `Cannot place order. Table status: ${table.status}. Table must be occupied or reserved.`,
        400
      );
    }

    next();
  }
);

// RATE LIMIT SESSION ACTIONS (PREVENT ABUSE)
const sessionActionCounts = new Map<
  string,
  { count: number; resetAt: number }
>();

export const RateLimitSession = (maxActions: number, windowMinutes: number) => {
  return CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.session) {
        throw new ErrorHandler("Session required.", 401);
      }

      const sessionId = req.session.sessionId;
      const now = Date.now();
      const windowMs = windowMinutes * 60 * 1000;

      const record = sessionActionCounts.get(sessionId);

      if (!record || now > record.resetAt) {
        sessionActionCounts.set(sessionId, {
          count: 1,
          resetAt: now + windowMs,
        });
        return next();
      }

      if (record.count >= maxActions) {
        throw new ErrorHandler(
          `Rate limit exceeded. Max ${maxActions} actions per ${windowMinutes} minutes.`,
          429
        );
      }

      record.count++;
      next();
    }
  );
};

// VERIFY DEVICE CONSISTENCY (PREVENT SESSION HIJACKING)
export const VerifyDeviceBinding = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.session) {
      throw new ErrorHandler("Session required.", 401);
    }

    if (!req.tokenPayload?.deviceId) {
      throw new ErrorHandler("Device ID missing from token.", 401);
    }

    if (req.session.deviceId !== req.tokenPayload.deviceId) {
      throw new ErrorHandler(
        "Device mismatch detected. Session bound to different device. Possible security violation.",
        403
      );
    }

    next();
  }
);

// CLEANUP EXPIRED SESSIONS (MIDDLEWARE FOR CRON-LIKE ROUTES)
export const CleanupExpiredSessions = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const cleanedCount = await tableSessionService.cleanupExpiredSessions();
    console.log(`🧹 Cleaned ${cleanedCount} expired sessions`);
    next();
  }
);
