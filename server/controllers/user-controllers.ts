import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import { UserRoleEnum } from "../enums/models-enums.js";

import { userService } from "../services/user-service.js";

import { ApiResponse } from "../utils/api-response-formatter.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { ErrorHandler } from "../utils/error-handler.js";

export const CreateUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, role, name } = req.body;

    const user = await userService.createUser({
      email,
      password,
      role,
      name,
    });

    return ApiResponse.created(
      res,
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      "User created successfully"
    );
  }
);

export const GetAllUsers = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await userService.getAllUsers();

    return ApiResponse.success(
      res,
      users.map((user) => ({
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      })),
      `Retrieved ${users.length} user(s) successfully`
    );
  }
);

export const GetActiveUsers = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await userService.getActiveUsers();

    return ApiResponse.success(
      res,
      users.map((user) => ({
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      })),
      `Retrieved ${users.length} active user(s) successfully`
    );
  }
);

export const GetUserById = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await userService.getUserById(userId);

    return ApiResponse.success(
      res,
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      "User retrieved successfully"
    );
  }
);

export const UpdateUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const updates = req.body;

    if (req.user?.userId === userId && updates.role) {
      if (
        req.user.role === UserRoleEnum.ADMIN &&
        updates.role !== UserRoleEnum.ADMIN
      ) {
        throw new ErrorHandler(
          "You cannot remove your own admin privileges",
          403
        );
      }
    }

    if (req.user?.userId === userId && updates.isActive === false) {
      throw new ErrorHandler("You cannot deactivate your own account", 403);
    }

    const updatedUser = await userService.updateUser(userId, updates);

    return ApiResponse.success(
      res,
      {
        userId: updatedUser.userId,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
      "User updated successfully"
    );
  }
);

export const DeleteUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    if (req.user?.userId === userId) {
      throw new ErrorHandler("You cannot delete your own account", 403);
    }

    await userService.deleteUser(userId);

    return ApiResponse.success(
      res,
      {
        deleted: true,
        userId,
      },
      "User deleted successfully"
    );
  }
);

export const DeactivateUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    if (req.user?.userId === userId) {
      throw new ErrorHandler("You cannot deactivate your own account", 403);
    }

    const user = await userService.deactivateUser(userId);

    return ApiResponse.success(
      res,
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
      },
      "User deactivated successfully"
    );
  }
);

export const ActivateUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await userService.activateUser(userId);

    return ApiResponse.success(
      res,
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
      },
      "User activated successfully"
    );
  }
);

export const ToggleUserStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    if (req.user?.userId === userId) {
      throw new ErrorHandler("You cannot toggle your own account status", 403);
    }

    const currentUser = await userService.getUserById(userId);

    const updatedUser = currentUser.isActive
      ? await userService.deactivateUser(userId)
      : await userService.activateUser(userId);

    return ApiResponse.success(
      res,
      {
        userId: updatedUser.userId,
        email: updatedUser.email,
        name: updatedUser.name,
        isActive: updatedUser.isActive,
        statusChanged: currentUser.isActive ? "deactivated" : "activated",
      },
      `User ${updatedUser.isActive ? "activated" : "deactivated"} successfully`
    );
  }
);

export const GetUsersByRole = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.params;

    const users = await userService.getUsersByRole(role as UserRoleEnum);

    return ApiResponse.success(
      res,
      users.map((user) => ({
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      })),
      `Retrieved ${users.length} user(s) with role '${role}'`
    );
  }
);

export const SearchUsers = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { searchTerm } = req.query;

    if (!searchTerm || typeof searchTerm !== "string") {
      throw new ErrorHandler("Search term is required", 400);
    }

    const users = await userService.searchUsers(searchTerm);

    return ApiResponse.success(
      res,
      users.map((user) => ({
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      })),
      `Found ${users.length} user(s) matching '${searchTerm}'`
    );
  }
);

export const GetUserStats = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await userService.getUserStats();

    return ApiResponse.success(
      res,
      {
        total: stats.total,
        active: stats.active,
        inactive: stats.inactive,
        byRole: {
          admin: stats.admin,
          kitchen: stats.kitchen,
          receptionist: stats.receptionist,
        },
        percentages: {
          activePercentage:
            stats.total > 0
              ? Math.round((stats.active / stats.total) * 100)
              : 0,
          adminPercentage:
            stats.total > 0 ? Math.round((stats.admin / stats.total) * 100) : 0,
          kitchenPercentage:
            stats.total > 0
              ? Math.round((stats.kitchen / stats.total) * 100)
              : 0,
          receptionistPercentage:
            stats.total > 0
              ? Math.round((stats.receptionist / stats.total) * 100)
              : 0,
        },
      },
      "User statistics retrieved successfully"
    );
  }
);

export const GetUserByEmail = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.params;

    const user = await userService.getUserByEmail(email);

    return ApiResponse.success(
      res,
      {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
      "User retrieved successfully"
    );
  }
);
