import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

import { IPayment } from "../types/models-interfaces.js";
import { PaymentMethodEnum, PaymentStatusEnum } from "../enums/models-enums.js";

const PaymentSchema: Schema = new Schema(
  {
    paymentId: {
      type: String,
      required: [true, "Payment ID is required"],
      unique: true,
      default: () => crypto.randomUUID(),
    },

    billId: {
      type: String,
      required: [true, "Bill ID is required"],
      ref: "Bill",
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },

    method: {
      type: String,
      enum: {
        values: Object.values(PaymentMethodEnum),
        message: "{VALUE} is not a valid payment method",
      },
      required: [true, "Payment method is required"],
      uppercase: true,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(PaymentStatusEnum),
        message: "{VALUE} is not a valid payment status",
      },
      default: PaymentStatusEnum.PENDING,
      uppercase: true,
    },

    transactionId: {
      type: String,
      trim: true,
      default: null,
    },

    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
    },

    webhookVerified: {
      type: Boolean,
      default: false,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      trim: true,
      maxlength: [500, "Failure reason cannot exceed 500 characters"],
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    refundReason: {
      type: String,
      trim: true,
      maxlength: [500, "Refund reason cannot exceed 500 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

PaymentSchema.index({ billId: 1, status: 1 });
PaymentSchema.index({ status: 1, createdAt: -1 });

const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
