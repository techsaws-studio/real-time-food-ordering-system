import { Router } from "express";

import {
  CreateUser,
  GetAllUsers,
  GetActiveUsers,
  GetUserById,
  UpdateUser,
  DeleteUser,
  DeactivateUser,
  ActivateUser,
  ToggleUserStatus,
  GetUsersByRole,
  SearchUsers,
  GetUserStats,
  GetUserByEmail,
} from "../controllers/user-controllers.js";

import { ValidateRequest } from "../middlewares/validation-middleware.js";
import { VerifyStaffAuth } from "../middlewares/auth-middleware.js";
import {
  RequireAdmin,
  RequireSelfOrAdmin,
} from "../middlewares/role-middleware.js";

import {
  RegisterUserSchema,
  GetUserByIdSchema,
  UpdateUserSchema,
  DeleteUserSchema,
  ToggleUserStatusSchema,
  SearchUsersSchema,
  GetUsersByRoleSchema,
} from "../validators/auth-validators.js";

const UserRouter = Router();
UserRouter.use(VerifyStaffAuth);

// ADMIN ROUTES
UserRouter.get("/stats", RequireAdmin, GetUserStats);
UserRouter.get(
  "/search",
  RequireAdmin,
  ValidateRequest(SearchUsersSchema),
  SearchUsers
);
UserRouter.get("/active", RequireAdmin, GetActiveUsers);
UserRouter.get(
  "/role/:role",
  RequireAdmin,
  ValidateRequest(GetUsersByRoleSchema),
  GetUsersByRole
);
UserRouter.get("/", RequireAdmin, GetAllUsers);
UserRouter.post(
  "/",
  RequireAdmin,
  ValidateRequest(RegisterUserSchema),
  CreateUser
);
UserRouter.get(
  "/:userId",
  RequireSelfOrAdmin,
  ValidateRequest(GetUserByIdSchema),
  GetUserById
);
UserRouter.put(
  "/:userId",
  RequireAdmin,
  ValidateRequest(UpdateUserSchema),
  UpdateUser
);
UserRouter.delete(
  "/:userId",
  RequireAdmin,
  ValidateRequest(DeleteUserSchema),
  DeleteUser
);
UserRouter.put(
  "/:userId/activate",
  RequireAdmin,
  ValidateRequest(ToggleUserStatusSchema),
  ActivateUser
);
UserRouter.put(
  "/:userId/deactivate",
  RequireAdmin,
  ValidateRequest(ToggleUserStatusSchema),
  DeactivateUser
);
UserRouter.put(
  "/:userId/toggle-status",
  RequireAdmin,
  ValidateRequest(ToggleUserStatusSchema),
  ToggleUserStatus
);
UserRouter.get("/email/:email", RequireAdmin, GetUserByEmail);

export default UserRouter;
