import { Request, Response, NextFunction } from "express";

import { UserRoleEnum } from "../enums/models-enums.js";

import { ErrorHandler } from "../utils/error-handler.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";

export const RequireRole = (allowedRoles: UserRoleEnum[]) => {
  return CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        throw new ErrorHandler(
          "Authentication required. User not found in request.",
          401
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new ErrorHandler(
          `Access denied. Required role: ${allowedRoles.join(
            " or "
          )}. Your role: ${req.user.role}`,
          403
        );
      }

      next();
    }
  );
};

// REQUIRE ADMIN ROLE
export const RequireAdmin = RequireRole([UserRoleEnum.ADMIN]);

// REQUIRE KITCHEN ROLE
export const RequireKitchen = RequireRole([UserRoleEnum.KITCHEN]);

// REQUIRE RECEPTIONIST ROLE
export const RequireReceptionist = RequireRole([UserRoleEnum.RECEPTIONIST]);

// REQUIRE KITCHEN OR ADMIN
export const RequireKitchenOrAdmin = RequireRole([
  UserRoleEnum.KITCHEN,
  UserRoleEnum.ADMIN,
]);

// REQUIRE ANY STAFF MEMBER (ADMIN, KITCHEN, OR RECEPTIONIST)
export const RequireStaff = RequireRole([
  UserRoleEnum.ADMIN,
  UserRoleEnum.KITCHEN,
  UserRoleEnum.RECEPTIONIST,
]);

// CHECK IF USER IS ACTIVE
export const RequireActiveUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new ErrorHandler("User not found in request.", 401);
    }

    if (!req.user.isActive) {
      throw new ErrorHandler(
        "Your account has been deactivated. Contact administrator.",
        403
      );
    }

    next();
  }
);

// CHECK IF USER OWNS RESOURCE (PASS USER ID TO COMPARE)
export const RequireOwnership = (userIdField: string = "userId") => {
  return CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        throw new ErrorHandler("Authentication required.", 401);
      }

      const resourceUserId =
        req.params[userIdField] ||
        req.body[userIdField] ||
        req.query[userIdField];

      if (!resourceUserId) {
        throw new ErrorHandler(
          `Resource owner ID (${userIdField}) not found in request.`,
          400
        );
      }

      if (req.user.userId !== resourceUserId) {
        if (req.user.role !== UserRoleEnum.ADMIN) {
          throw new ErrorHandler(
            "Access denied. You can only access your own resources.",
            403
          );
        }
      }

      next();
    }
  );
};

// REQUIRE SELF OR ADMIN (FOR PROFILE UPDATES)
export const RequireSelfOrAdmin = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      throw new ErrorHandler("Authentication required.", 401);
    }

    const targetUserId = req.params.userId || req.body.userId;

    if (!targetUserId) {
      throw new ErrorHandler("Target user ID not provided.", 400);
    }

    const isSelf = req.user.userId === targetUserId;
    const isAdmin = req.user.role === UserRoleEnum.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ErrorHandler(
        "Access denied. You can only modify your own account.",
        403
      );
    }

    next();
  }
);
