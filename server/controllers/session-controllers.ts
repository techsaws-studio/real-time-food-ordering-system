import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import { tableSessionService } from "../services/table-session-service.js";
import { tableService } from "../services/table-service.js";

import { tableSessionRepository } from "../repositories/table-session-repository.js";

import { ApiResponse } from "../utils/api-response-formatter.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { ErrorHandler } from "../utils/error-handler.js";
import { GenerateJWT } from "../utils/jwt-helper.js";
import { GenerateSecurityCode } from "../utils/security-code-generator.js";

export const CreateSession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId, deviceId } = req.body;
    const createdBy = req.user?.userId;

    if (!createdBy) {
      throw new ErrorHandler("User ID not found in request", 401);
    }

    const table = await tableService.validateTableForSession(tableId);

    const { session, securityCode } = await tableSessionService.createSession(
      tableId,
      deviceId,
      createdBy
    );

    return ApiResponse.created(
      res,
      {
        sessionId: session.sessionId,
        tableId: session.tableId,
        tableNumber: table.tableNumber,
        location: table.location,
        securityCode,
        expiresAt: session.expiresAt,
        maxVerificationAttempts: session.maxVerificationAttempts,
        createdAt: session.createdAt,
      },
      "Session created successfully. Provide security code to customer."
    );
  }
);

export const VerifySession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId, securityCode } = req.body;

    const session = await tableSessionService.verifySession(
      sessionId,
      securityCode
    );

    const token = GenerateJWT({
      sessionId: session.sessionId,
      tableId: session.tableId,
      deviceId: session.deviceId,
    });

    const table = await tableService.getTableById(session.tableId);

    if (table.status === "AVAILABLE") {
      await tableService.markAsOccupied(session.tableId);
    }

    return ApiResponse.success(
      res,
      {
        verified: true,
        sessionId: session.sessionId,
        tableId: session.tableId,
        tableNumber: table.tableNumber,
        location: table.location,
        token,
        expiresAt: session.expiresAt,
        verifiedAt: session.verifiedAt,
      },
      "Session verified successfully. You can now place orders."
    );
  }
);

export const GetSessionById = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;

    const session = await tableSessionService.getSessionById(sessionId);
    const table = await tableService.getTableById(session.tableId);

    return ApiResponse.success(
      res,
      {
        sessionId: session.sessionId,
        tableId: session.tableId,
        tableNumber: table.tableNumber,
        location: table.location,
        isActive: session.isActive,
        isVerified: session.isVerified,
        verificationAttempts: session.verificationAttempts,
        maxVerificationAttempts: session.maxVerificationAttempts,
        expiresAt: session.expiresAt,
        verifiedAt: session.verifiedAt,
        endedAt: session.endedAt,
        createdBy: session.createdBy,
        createdAt: session.createdAt,
      },
      "Session retrieved successfully"
    );
  }
);

export const EndSession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;

    const session = await tableSessionService.endSession(sessionId);

    try {
      await tableService.markAsAvailable(session.tableId);
    } catch (error) {
      console.warn(
        `Could not mark table ${session.tableId} as available:`,
        (error as Error).message
      );
    }

    return ApiResponse.success(
      res,
      {
        sessionId: session.sessionId,
        tableId: session.tableId,
        isActive: session.isActive,
        endedAt: session.endedAt,
      },
      "Session ended successfully"
    );
  }
);

export const ForceEndSession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = await tableSessionService.getSessionById(sessionId);

    if (!session.isActive) {
      throw new ErrorHandler("Session is already ended", 400);
    }

    const endedSession = await tableSessionService.endSession(sessionId);

    console.log(
      `Session ${sessionId} force ended by ${req.user?.userId}. Reason: ${reason}`
    );

    try {
      await tableService.markAsAvailable(endedSession.tableId);
    } catch (error) {
      console.warn(
        `Could not mark table ${endedSession.tableId} as available:`,
        (error as Error).message
      );
    }

    return ApiResponse.success(
      res,
      {
        sessionId: endedSession.sessionId,
        tableId: endedSession.tableId,
        isActive: endedSession.isActive,
        endedAt: endedSession.endedAt,
        forcedBy: req.user?.userId,
        reason,
      },
      "Session forcefully terminated"
    );
  }
);

export const ValidateSession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== "string") {
      throw new ErrorHandler("Session ID is required", 400);
    }

    try {
      const session = await tableSessionService.validateActiveSession(
        sessionId
      );
      const table = await tableService.getTableById(session.tableId);

      return ApiResponse.success(
        res,
        {
          valid: true,
          sessionId: session.sessionId,
          tableId: session.tableId,
          tableNumber: table.tableNumber,
          expiresAt: session.expiresAt,
          remainingTime: Math.max(0, session.expiresAt.getTime() - Date.now()),
        },
        "Session is valid"
      );
    } catch (error) {
      return ApiResponse.success(
        res,
        {
          valid: false,
          reason: (error as Error).message,
        },
        "Session is invalid"
      );
    }
  }
);

export const GetActiveSessions = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.query;

    let sessions;

    if (tableId && typeof tableId === "string") {
      const session = await tableSessionRepository.findActiveSessionByTableId(
        tableId
      );
      sessions = session ? [session] : [];
    } else {
      const allSessions = await tableSessionRepository.getSessionsByDateRange(
        new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        new Date()
      );
      sessions = allSessions.filter(
        (s) => s.isActive && s.expiresAt > new Date()
      );
    }

    const sessionsWithTableInfo = await Promise.all(
      sessions.map(async (session) => {
        const table = await tableService.getTableById(session.tableId);
        return {
          sessionId: session.sessionId,
          tableId: session.tableId,
          tableNumber: table.tableNumber,
          location: table.location,
          isVerified: session.isVerified,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
          verifiedAt: session.verifiedAt,
        };
      })
    );

    return ApiResponse.success(
      res,
      {
        count: sessionsWithTableInfo.length,
        sessions: sessionsWithTableInfo,
      },
      `Found ${sessionsWithTableInfo.length} active session(s)`
    );
  }
);

export const GetActiveSessionsCount = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const count = await tableSessionService.getActiveSessionsCount();

    return ApiResponse.success(
      res,
      {
        activeSessionsCount: count,
        timestamp: new Date().toISOString(),
      },
      "Active sessions count retrieved"
    );
  }
);

export const GetSessionsByTable = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;

    const table = await tableService.getTableById(tableId);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const allSessions = await tableSessionRepository.getSessionsByDateRange(
      thirtyDaysAgo,
      new Date()
    );

    const tableSessions = allSessions.filter(
      (s) => s.tableId.toUpperCase() === tableId.toUpperCase()
    );

    return ApiResponse.success(
      res,
      {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        sessionsCount: tableSessions.length,
        sessions: tableSessions.map((session) => ({
          sessionId: session.sessionId,
          isActive: session.isActive,
          isVerified: session.isVerified,
          expiresAt: session.expiresAt,
          verifiedAt: session.verifiedAt,
          endedAt: session.endedAt,
          createdAt: session.createdAt,
        })),
      },
      `Found ${tableSessions.length} session(s) for table ${table.tableNumber}`
    );
  }
);

export const GetSessionsByDateRange = CatchAsyncErrors(
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

    const sessions = await tableSessionService.getSessionsByDateRange(
      start,
      end
    );

    return ApiResponse.success(
      res,
      {
        count: sessions.length,
        dateRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        sessions: sessions.map((session) => ({
          sessionId: session.sessionId,
          tableId: session.tableId,
          isActive: session.isActive,
          isVerified: session.isVerified,
          expiresAt: session.expiresAt,
          verifiedAt: session.verifiedAt,
          endedAt: session.endedAt,
          createdAt: session.createdAt,
        })),
      },
      `Found ${sessions.length} session(s) in date range`
    );
  }
);

export const CleanupExpiredSessions = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { dryRun } = req.query;
    const isDryRun = dryRun === "true";

    if (isDryRun) {
      const allSessions = await tableSessionRepository.getSessionsByDateRange(
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        new Date()
      );

      const expiredCount = allSessions.filter(
        (s) => s.isActive && s.expiresAt < new Date()
      ).length;

      return ApiResponse.success(
        res,
        {
          dryRun: true,
          wouldCleanup: expiredCount,
        },
        `Dry run: ${expiredCount} session(s) would be cleaned up`
      );
    }

    const cleanedCount = await tableSessionService.cleanupExpiredSessions();

    return ApiResponse.success(
      res,
      {
        cleaned: cleanedCount,
        timestamp: new Date().toISOString(),
      },
      `Successfully cleaned up ${cleanedCount} expired session(s)`
    );
  }
);

export const GetSessionStats = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { period } = req.query;

    let startDate: Date;
    const endDate = new Date();

    switch (period) {
      case "week":
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "today":
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
    }

    const sessions = await tableSessionService.getSessionsByDateRange(
      startDate,
      endDate
    );

    const activeCount = await tableSessionService.getActiveSessionsCount();

    const totalSessions = sessions.length;
    const verifiedSessions = sessions.filter((s) => s.isVerified).length;
    const expiredWithoutVerification = sessions.filter(
      (s) => !s.isVerified && !s.isActive
    ).length;
    const averageVerificationAttempts =
      totalSessions > 0
        ? sessions.reduce((sum, s) => sum + s.verificationAttempts, 0) /
          totalSessions
        : 0;

    return ApiResponse.success(
      res,
      {
        period: period || "today",
        dateRange: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        stats: {
          total: totalSessions,
          active: activeCount,
          verified: verifiedSessions,
          unverified: totalSessions - verifiedSessions,
          expiredWithoutVerification,
          averageVerificationAttempts:
            Math.round(averageVerificationAttempts * 100) / 100,
          verificationRate:
            totalSessions > 0
              ? Math.round((verifiedSessions / totalSessions) * 100)
              : 0,
        },
      },
      "Session statistics retrieved successfully"
    );
  }
);

export const RegenerateSecurityCode = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const { reason } = req.body;

    const session = await tableSessionService.getSessionById(sessionId);

    if (!session.isActive) {
      throw new ErrorHandler(
        "Cannot regenerate code for inactive session",
        400
      );
    }

    if (session.isVerified) {
      throw new ErrorHandler(
        "Cannot regenerate code for already verified session",
        400
      );
    }

    const newSecurityCode = GenerateSecurityCode();

    const updatedSession = await tableSessionRepository.updateSession(
      sessionId,
      {
        securityCode: newSecurityCode,
        verificationAttempts: 0,
      }
    );

    if (!updatedSession) {
      throw new ErrorHandler("Failed to regenerate security code", 500);
    }

    console.log(
      `Security code regenerated for session ${sessionId} by ${
        req.user?.userId
      }. Reason: ${reason || "Not provided"}`
    );

    return ApiResponse.success(
      res,
      {
        sessionId: updatedSession.sessionId,
        tableId: updatedSession.tableId,
        securityCode: newSecurityCode,
        verificationAttempts: updatedSession.verificationAttempts,
        maxVerificationAttempts: updatedSession.maxVerificationAttempts,
        regeneratedBy: req.user?.userId,
      },
      "Security code regenerated successfully. Provide new code to customer."
    );
  }
);

export const ExtendSession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const { additionalHours } = req.body;

    const session = await tableSessionService.getSessionById(sessionId);

    if (!session.isActive) {
      throw new ErrorHandler("Cannot extend inactive session", 400);
    }

    if (!session.isVerified) {
      throw new ErrorHandler("Cannot extend unverified session", 400);
    }

    const currentExpiry = new Date(session.expiresAt);
    const newExpiry = new Date(
      currentExpiry.getTime() + additionalHours * 60 * 60 * 1000
    );

    const maxExpiry = new Date(session.createdAt);
    maxExpiry.setHours(maxExpiry.getHours() + 8);

    if (newExpiry > maxExpiry) {
      throw new ErrorHandler(
        "Cannot extend session beyond 8 hours from creation",
        400
      );
    }

    const updatedSession = await tableSessionRepository.updateSession(
      sessionId,
      {
        expiresAt: newExpiry,
      }
    );

    if (!updatedSession) {
      throw new ErrorHandler("Failed to extend session", 500);
    }

    return ApiResponse.success(
      res,
      {
        sessionId: updatedSession.sessionId,
        tableId: updatedSession.tableId,
        previousExpiry: currentExpiry.toISOString(),
        newExpiry: newExpiry.toISOString(),
        extendedBy: `${additionalHours} hour(s)`,
      },
      "Session extended successfully"
    );
  }
);

export const TransferSession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;
    const { newTableId, reason } = req.body;

    const session = await tableSessionService.getSessionById(sessionId);

    if (!session.isActive) {
      throw new ErrorHandler("Cannot transfer inactive session", 400);
    }

    const newTable = await tableService.validateTableForSession(newTableId);

    const existingSession =
      await tableSessionRepository.findActiveSessionByTableId(newTableId);

    if (existingSession) {
      throw new ErrorHandler(
        `Table ${newTable.tableNumber} already has an active session`,
        400
      );
    }

    const oldTableId = session.tableId;
    const updatedSession = await tableSessionRepository.updateSession(
      sessionId,
      {
        tableId: newTableId.toUpperCase(),
      }
    );

    if (!updatedSession) {
      throw new ErrorHandler("Failed to transfer session", 500);
    }

    await tableService.markAsAvailable(oldTableId);
    await tableService.markAsOccupied(newTableId);

    console.log(
      `Session ${sessionId} transferred from ${oldTableId} to ${newTableId} by ${req.user?.userId}. Reason: ${reason}`
    );

    return ApiResponse.success(
      res,
      {
        sessionId: updatedSession.sessionId,
        previousTableId: oldTableId,
        newTableId: updatedSession.tableId,
        tableNumber: newTable.tableNumber,
        location: newTable.location,
        transferredBy: req.user?.userId,
        reason,
      },
      "Session transferred successfully"
    );
  }
);
