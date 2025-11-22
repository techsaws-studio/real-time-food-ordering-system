import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

import { ITableSession } from "../types/models-interfaces.js";

const TableSessionSchema: Schema = new Schema(
  {
    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      unique: true,
      default: () => crypto.randomUUID(),
    },

    tableId: {
      type: String,
      required: [true, "Table ID is required"],
      uppercase: true,
      trim: true,
      ref: "Table",
    },

    securityCode: {
      type: String,
      required: [true, "Security code is required"],
      length: [6, "Security code must be exactly 6 digits"],
      match: [/^\d{6}$/, "Security code must be 6 digits"],
    },

    deviceId: {
      type: String,
      required: [true, "Device ID is required"],
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationAttempts: {
      type: Number,
      default: 0,
      min: [0, "Verification attempts cannot be negative"],
    },

    maxVerificationAttempts: {
      type: Number,
      default: 3,
      min: [1, "Max attempts must be at least 1"],
    },

    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    endedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: String,
      required: [true, "Creator ID is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

TableSessionSchema.index({ tableId: 1, isActive: 1 });
TableSessionSchema.index({ sessionId: 1, isActive: 1 });
TableSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const TableSession = mongoose.model<ITableSession>(
  "TableSession",
  TableSessionSchema
);
export default TableSession;
