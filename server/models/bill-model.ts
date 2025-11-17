import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

import { IBill } from "../types/models-interfaces.js";
import { BillStatusEnum } from "../enums/models-enums.js";

const BillSchema: Schema = new Schema(
  {
    billId: {
      type: String,
      required: [true, "Bill ID is required"],
      unique: true,
      default: () => crypto.randomUUID(),
      index: true,
    },

    tableId: {
      type: String,
      required: [true, "Table ID is required"],
      uppercase: true,
      trim: true,
      ref: "Table",
      index: true,
    },

    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      ref: "TableSession",
      index: true,
    },

    orders: {
      type: [String],
      required: [true, "Orders are required"],
      validate: {
        validator: function (orders: string[]) {
          return orders.length > 0;
        },
        message: "Bill must contain at least one order",
      },
    },

    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },

    tax: {
      type: Number,
      required: [true, "Tax is required"],
      min: [0, "Tax cannot be negative"],
      default: 0,
    },

    taxRate: {
      type: Number,
      required: [true, "Tax rate is required"],
      min: [0, "Tax rate cannot be negative"],
      max: [100, "Tax rate cannot exceed 100%"],
      default: 0,
    },

    serviceCharge: {
      type: Number,
      required: [true, "Service charge is required"],
      min: [0, "Service charge cannot be negative"],
      default: 0,
    },

    serviceChargeRate: {
      type: Number,
      required: [true, "Service charge rate is required"],
      min: [0, "Service charge rate cannot be negative"],
      max: [100, "Service charge rate cannot exceed 100%"],
      default: 0,
    },

    discount: {
      type: Number,
      required: [true, "Discount is required"],
      min: [0, "Discount cannot be negative"],
      default: 0,
    },

    discountRate: {
      type: Number,
      required: [true, "Discount rate is required"],
      min: [0, "Discount rate cannot be negative"],
      max: [100, "Discount rate cannot exceed 100%"],
      default: 0,
    },

    promoCode: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
    },

    total: {
      type: Number,
      required: [true, "Total is required"],
      min: [0, "Total cannot be negative"],
    },

    status: {
      type: String,
      enum: {
        values: Object.values(BillStatusEnum),
        message: "{VALUE} is not a valid bill status",
      },
      default: BillStatusEnum.OPEN,
      uppercase: true,
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    closedBy: {
      type: String,
      ref: "User",
      default: null,
    },

    voidedAt: {
      type: Date,
      default: null,
    },

    voidedBy: {
      type: String,
      ref: "User",
      default: null,
    },

    voidReason: {
      type: String,
      trim: true,
      maxlength: [500, "Void reason cannot exceed 500 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

BillSchema.index({ tableId: 1, status: 1 });
BillSchema.index({ sessionId: 1, status: 1 });
BillSchema.index({ status: 1, createdAt: -1 });

const Bill = mongoose.model<IBill>("Bill", BillSchema);
export default Bill;
