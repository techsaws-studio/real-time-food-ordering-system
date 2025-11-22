import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

import { IUser } from "../types/models-interfaces.js";
import { UserRoleEnum } from "../enums/models-enums.js";

const UserSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      unique: true,
      default: () => crypto.randomUUID(),
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: Object.values(UserRoleEnum),
        message: "{VALUE} is not a valid role",
      },
      required: [true, "Role is required"],
      uppercase: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.index({ role: 1, isActive: 1 });

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
