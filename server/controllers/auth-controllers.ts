import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import { UserRoleEnum } from "../enums/models-enums.js";

import { userService } from "../services/user-service.js";

import { ApiResponse } from "../utils/api-response-formatter.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { GenerateAdminJWT } from "../utils/jwt-helper.js";
import { ErrorHandler } from "../utils/error-handler.js";

export const RegisterUser = CatchAsyncErrors(
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
      "User registered successfully"
    );
  }
);

export const Login = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const { user } = await userService.authenticateUser(email, password);

    const token = GenerateAdminJWT({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ApiResponse.success(
      res,
      {
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
        token,
      },
      "Login successful"
    );
  }
);

export const Logout = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return ApiResponse.success(
      res,
      {
        loggedOut: true,
        timestamp: new Date().toISOString(),
      },
      "Logout successful"
    );
  }
);

export const RefreshToken = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ErrorHandler("User not authenticated", 401);
    }

    const user = await userService.getUserById(userId);

    const token = GenerateAdminJWT({
      userId: user.userId,
      email: user.email,
      role: user.role,
    });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return ApiResponse.success(
      res,
      {
        user: {
          userId: user.userId,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
        },
        token,
        expiresIn: "7d",
      },
      "Token refreshed successfully"
    );
  }
);

export const GetCurrentUser = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new ErrorHandler("User not authenticated", 401);
    }

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
      "User profile retrieved successfully"
    );
  }
);

export const ChangePassword = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (req.user?.userId !== userId && req.user?.role !== UserRoleEnum.ADMIN) {
      throw new ErrorHandler("You can only change your own password", 403);
    }

    await userService.changePassword(userId, currentPassword, newPassword);

    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return ApiResponse.success(
      res,
      {
        passwordChanged: true,
        requireRelogin: true,
      },
      "Password changed successfully. Please login again."
    );
  }
);

export const ResetPassword = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    await userService.resetPassword(userId, newPassword);

    return ApiResponse.success(
      res,
      {
        passwordReset: true,
        userId,
      },
      "Password reset successfully. User must login with new password."
    );
  }
);

export const ValidateToken = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const isValid = !!req.tokenPayload;
    const userId = req.user?.userId;

    if (!isValid || !userId) {
      return ApiResponse.success(
        res,
        {
          valid: false,
          authenticated: false,
        },
        "No valid token found"
      );
    }

    try {
      const user = await userService.getUserById(userId);

      return ApiResponse.success(
        res,
        {
          valid: true,
          authenticated: true,
          user: {
            userId: user.userId,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
          },
        },
        "Token is valid"
      );
    } catch (error) {
      return ApiResponse.success(
        res,
        {
          valid: false,
          authenticated: false,
        },
        "User no longer exists"
      );
    }
  }
);

export const VerifySession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ErrorHandler("No active session found", 401);
    }

    return ApiResponse.success(
      res,
      {
        authenticated: true,
        sessionValid: true,
        user: {
          userId: req.user.userId,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
        },
      },
      "Session is valid"
    );
  }
);
