import { Request, Response, NextFunction } from "express";

import { userService } from "../services/user-service.js";
import { tableSessionService } from "../services/table-session-service.js";

import { VerifyJWT } from "../utils/jwt-helper.js";
import { ErrorHandler } from "../utils/error-handler.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return authHeader;
};

const extractTokenFromCookie = (req: Request): string | null => {
  return req.cookies?.token || null;
};

export const VerifyAuthentication = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = extractToken(req) || extractTokenFromCookie(req);

    if (!token) {
      throw new ErrorHandler(
        "Authentication required. No token provided.",
        401
      );
    }

    try {
      const decoded = VerifyJWT(token);
      req.tokenPayload = decoded;
      next();
    } catch (error) {
      if ((error as Error).message === "Token has expired") {
        throw new ErrorHandler("Session expired. Please login again.", 401);
      }
      throw new ErrorHandler("Invalid authentication token.", 401);
    }
  }
);

export const VerifyStaffAuth = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await VerifyAuthentication(req, res, async () => {
      const payload = req.tokenPayload;

      if (!payload || !payload.role) {
        throw new ErrorHandler(
          "Invalid token. Staff authentication required.",
          401
        );
      }

      const userId = (payload as any).userId;
      if (!userId) {
        throw new ErrorHandler("Invalid staff token structure.", 401);
      }

      const user = await userService.getUserById(userId);

      if (!user.isActive) {
        throw new ErrorHandler(
          "Account is deactivated. Contact administrator.",
          403
        );
      }

      req.user = user;
      next();
    });
  }
);

export const VerifyCustomerSession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await VerifyAuthentication(req, res, async () => {
      const payload = req.tokenPayload;

      if (!payload?.sessionId) {
        throw new ErrorHandler(
          "Invalid token. Session authentication required.",
          401
        );
      }

      const session = await tableSessionService.validateActiveSession(
        payload.sessionId
      );

      if (payload.deviceId && session.deviceId !== payload.deviceId) {
        throw new ErrorHandler(
          "Session is bound to a different device. Please scan QR code again.",
          403
        );
      }

      req.session = session;
      req.tokenPayload = payload;
      next();
    });
  }
);

export const OptionalAuth = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = extractToken(req) || extractTokenFromCookie(req);

    if (!token) {
      return next();
    }

    try {
      const decoded = VerifyJWT(token);
      req.tokenPayload = decoded;

      if (decoded.sessionId) {
        try {
          const session = await tableSessionService.getSessionById(
            decoded.sessionId
          );
          req.session = session;
        } catch (error) {}
      }

      if ((decoded as any).userId) {
        try {
          const user = await userService.getUserById((decoded as any).userId);
          req.user = user;
        } catch (error) {}
      }
    } catch (error) {}

    next();
  }
);

export const VerifyTokenOnly = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = extractToken(req) || extractTokenFromCookie(req);

    if (!token) {
      throw new ErrorHandler("Authentication required.", 401);
    }

    try {
      const decoded = VerifyJWT(token);
      req.tokenPayload = decoded;
      next();
    } catch (error) {
      throw new ErrorHandler("Invalid or expired token.", 401);
    }
  }
);
