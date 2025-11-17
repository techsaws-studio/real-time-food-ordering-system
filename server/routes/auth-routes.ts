import { Router } from "express";

import {
  RegisterUser,
  Login,
  Logout,
  RefreshToken,
  GetCurrentUser,
  ChangePassword,
  ResetPassword,
  ValidateToken,
  VerifySession,
} from "../controllers/auth-controllers.js";

import { ValidateRequest } from "../middlewares/validation-middleware.js";
import {
  VerifyStaffAuth,
  OptionalAuth,
} from "../middlewares/auth-middleware.js";
import {
  RequireAdmin,
  RequireSelfOrAdmin,
} from "../middlewares/role-middleware.js";

import {
  RegisterUserSchema,
  LoginSchema,
  ChangePasswordSchema,
  ResetPasswordSchema,
} from "../validators/auth-validators.js";

const AuthRouter = Router();

// PUBLIC ROUTES
AuthRouter.post("/login", ValidateRequest(LoginSchema), Login);
AuthRouter.post("/validate-token", OptionalAuth, ValidateToken);

// PROTECTED ROUTES
AuthRouter.post("/logout", VerifyStaffAuth, Logout);
AuthRouter.post("/refresh-token", VerifyStaffAuth, RefreshToken);
AuthRouter.get("/me", VerifyStaffAuth, GetCurrentUser);
AuthRouter.get("/verify-session", VerifyStaffAuth, VerifySession);
AuthRouter.put(
  "/change-password/:userId",
  VerifyStaffAuth,
  RequireSelfOrAdmin,
  ValidateRequest(ChangePasswordSchema),
  ChangePassword
);

// ADMIN-ONLY ROUTES
AuthRouter.post(
  "/register",
  VerifyStaffAuth,
  RequireAdmin,
  ValidateRequest(RegisterUserSchema),
  RegisterUser
);
AuthRouter.post(
  "/reset-password/:userId",
  VerifyStaffAuth,
  RequireAdmin,
  ValidateRequest(ResetPasswordSchema),
  ResetPassword
);

export default AuthRouter;
