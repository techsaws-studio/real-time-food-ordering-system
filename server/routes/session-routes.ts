import { Router } from "express";

import {
  CreateSession,
  VerifySession,
  GetSessionById,
  EndSession,
  ForceEndSession,
  ValidateSession,
  GetActiveSessions,
  GetActiveSessionsCount,
  GetSessionsByTable,
  GetSessionsByDateRange,
  CleanupExpiredSessions,
  GetSessionStats,
  RegenerateSecurityCode,
  ExtendSession,
  TransferSession,
} from "../controllers/session-controllers.js";

import { ValidateRequest } from "../middlewares/validation-middleware.js";
import { VerifyStaffAuth } from "../middlewares/auth-middleware.js";
import {
  RequireAdmin,
  RequireStaff,
  RequireReceptionist,
} from "../middlewares/role-middleware.js";

import {
  CreateSessionSchema,
  VerifySessionSchema,
  GetSessionByIdSchema,
  EndSessionSchema,
  ForceEndSessionSchema,
  ValidateSessionSchema,
  GetSessionsByTableSchema,
  GetSessionsByDateRangeSchema,
  CleanupExpiredSessionsSchema,
  GetSessionStatsSchema,
  RegenerateSecurityCodeSchema,
  ExtendSessionSchema,
  TransferSessionSchema,
  GetActiveSessionsCountSchema,
} from "../validators/session-validators.js";

const SessionRouter = Router();
SessionRouter.use(VerifyStaffAuth);

// PUBLIC ROUTES
SessionRouter.post(
  "/verify",
  ValidateRequest(VerifySessionSchema),
  VerifySession
);
SessionRouter.get(
  "/validate",
  ValidateRequest(ValidateSessionSchema),
  ValidateSession
);

// STAFF-PROTECTED ROUTES
SessionRouter.get(
  "/stats",
  RequireStaff,
  ValidateRequest(GetSessionStatsSchema),
  GetSessionStats
);
SessionRouter.get(
  "/active/count",
  RequireStaff,
  ValidateRequest(GetActiveSessionsCountSchema),
  GetActiveSessionsCount
);
SessionRouter.get("/active", RequireStaff, GetActiveSessions);
SessionRouter.get(
  "/date-range",
  RequireStaff,
  ValidateRequest(GetSessionsByDateRangeSchema),
  GetSessionsByDateRange
);
SessionRouter.post(
  "/",
  RequireReceptionist,
  ValidateRequest(CreateSessionSchema),
  CreateSession
);
SessionRouter.get(
  "/table/:tableId",
  RequireStaff,
  ValidateRequest(GetSessionsByTableSchema),
  GetSessionsByTable
);
SessionRouter.get(
  "/:sessionId",
  RequireStaff,
  ValidateRequest(GetSessionByIdSchema),
  GetSessionById
);
SessionRouter.delete(
  "/:sessionId",
  RequireStaff,
  ValidateRequest(EndSessionSchema),
  EndSession
);
SessionRouter.post(
  "/:sessionId/force-end",
  RequireStaff,
  ValidateRequest(ForceEndSessionSchema),
  ForceEndSession
);
SessionRouter.post(
  "/:sessionId/regenerate-code",
  RequireReceptionist,
  ValidateRequest(RegenerateSecurityCodeSchema),
  RegenerateSecurityCode
);
SessionRouter.post(
  "/:sessionId/extend",
  RequireStaff,
  ValidateRequest(ExtendSessionSchema),
  ExtendSession
);

// ADMIN-ONLY ROUTES
SessionRouter.post(
  "/:sessionId/transfer",
  RequireAdmin,
  ValidateRequest(TransferSessionSchema),
  TransferSession
);
SessionRouter.post(
  "/cleanup",
  RequireAdmin,
  ValidateRequest(CleanupExpiredSessionsSchema),
  CleanupExpiredSessions
);

export default SessionRouter;
