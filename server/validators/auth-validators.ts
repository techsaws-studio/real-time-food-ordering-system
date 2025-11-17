import { z } from "zod";
import { UserRoleEnum } from "../enums/models-enums.js";

// ============================================================================
// REGISTER / CREATE USER
// ============================================================================

export const RegisterUserSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email format")
      .min(5, "Email must be at least 5 characters")
      .max(100, "Email cannot exceed 100 characters")
      .trim()
      .toLowerCase(),

    password: z
      .string({ message: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password cannot exceed 128 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),

    name: z
      .string({ message: "Name is required" })
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),

    role: z.nativeEnum(UserRoleEnum, {
      message: `Role must be one of: ${Object.values(UserRoleEnum).join(", ")}`,
    }),
  }),
});

// ============================================================================
// LOGIN
// ============================================================================

export const LoginSchema = z.object({
  body: z.object({
    email: z
      .string({ message: "Email is required" })
      .email("Invalid email format")
      .trim()
      .toLowerCase(),

    password: z
      .string({ message: "Password is required" })
      .min(1, "Password cannot be empty"),
  }),
});

// ============================================================================
// CHANGE PASSWORD
// ============================================================================

export const ChangePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({ message: "Current password is required" })
        .min(1, "Current password cannot be empty"),

      newPassword: z
        .string({ message: "New password is required" })
        .min(8, "New password must be at least 8 characters")
        .max(128, "New password cannot exceed 128 characters")
        .regex(
          /[A-Z]/,
          "New password must contain at least one uppercase letter"
        )
        .regex(
          /[a-z]/,
          "New password must contain at least one lowercase letter"
        )
        .regex(/[0-9]/, "New password must contain at least one number"),

      confirmPassword: z
        .string({ message: "Confirm password is required" })
        .min(1, "Confirm password cannot be empty"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "New password and confirm password must match",
      path: ["confirmPassword"],
    }),

  params: z.object({
    userId: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
  }),
});

// ============================================================================
// RESET PASSWORD (ADMIN)
// ============================================================================

export const ResetPasswordSchema = z.object({
  body: z.object({
    newPassword: z
      .string({ message: "New password is required" })
      .min(8, "New password must be at least 8 characters")
      .max(128, "New password cannot exceed 128 characters")
      .regex(/[A-Z]/, "New password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New password must contain at least one lowercase letter")
      .regex(/[0-9]/, "New password must contain at least one number"),
  }),

  params: z.object({
    userId: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
  }),
});

// ============================================================================
// UPDATE USER
// ============================================================================

export const UpdateUserSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name cannot exceed 100 characters")
        .trim()
        .optional(),

      role: z.nativeEnum(UserRoleEnum).optional(),

      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),

  params: z.object({
    userId: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
  }),
});

// ============================================================================
// GET USER BY ID
// ============================================================================

export const GetUserByIdSchema = z.object({
  params: z.object({
    userId: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
  }),
});

// ============================================================================
// DELETE USER
// ============================================================================

export const DeleteUserSchema = z.object({
  params: z.object({
    userId: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
  }),
});

// ============================================================================
// DEACTIVATE / ACTIVATE USER
// ============================================================================

export const ToggleUserStatusSchema = z.object({
  params: z.object({
    userId: z
      .string({ message: "User ID is required" })
      .uuid("Invalid user ID format"),
  }),
});

// ============================================================================
// SEARCH USERS
// ============================================================================

export const SearchUsersSchema = z.object({
  query: z.object({
    searchTerm: z
      .string({ message: "Search term is required" })
      .min(1, "Search term cannot be empty")
      .max(100, "Search term cannot exceed 100 characters")
      .trim(),
  }),
});

// ============================================================================
// GET USERS BY ROLE
// ============================================================================

export const GetUsersByRoleSchema = z.object({
  params: z.object({
    role: z.nativeEnum(UserRoleEnum, {
      message: `Role must be one of: ${Object.values(UserRoleEnum).join(", ")}`,
    }),
  }),
});

// ============================================================================
// REFRESH TOKEN
// ============================================================================

export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ message: "Refresh token is required" })
      .min(1, "Refresh token cannot be empty"),
  }),
});
