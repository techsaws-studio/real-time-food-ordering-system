import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

import { IOrder, IOrderItem } from "../types/models-interfaces.js";
import { OrderStatusEnum } from "../enums/models-enums.js";

const OrderItemSchema = new Schema<IOrderItem>(
  {
    itemId: {
      type: String,
      required: [true, "Item ID is required"],
      ref: "MenuItem",
    },

    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Item price is required"],
      min: [0, "Price cannot be negative"],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      max: [99, "Quantity cannot exceed 99"],
    },

    customizations: {
      type: [String],
      default: [],
    },

    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema(
  {
    orderId: {
      type: String,
      required: [true, "Order ID is required"],
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

    sessionId: {
      type: String,
      required: [true, "Session ID is required"],
      ref: "TableSession",
    },

    items: {
      type: [OrderItemSchema],
      required: [true, "Order items are required"],
      validate: {
        validator: function (items: IOrderItem[]) {
          return items.length > 0;
        },
        message: "Order must contain at least one item",
      },
    },

    status: {
      type: String,
      enum: {
        values: Object.values(OrderStatusEnum),
        message: "{VALUE} is not a valid order status",
      },
      default: OrderStatusEnum.PLACED,
      uppercase: true,
    },

    specialInstructions: {
      type: String,
      trim: true,
      maxlength: [500, "Special instructions cannot exceed 500 characters"],
      default: null,
    },

    estimatedTime: {
      type: Number,
      min: [1, "Estimated time must be at least 1 minute"],
      max: [180, "Estimated time cannot exceed 180 minutes"],
      default: null,
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    placedAt: {
      type: Date,
      required: [true, "Placed time is required"],
      default: Date.now,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    acceptedBy: {
      type: String,
      ref: "User",
      default: null,
    },

    inKitchenAt: {
      type: Date,
      default: null,
    },

    readyAt: {
      type: Date,
      default: null,
    },

    servedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    rejectedBy: {
      type: String,
      ref: "User",
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    cancelledBy: {
      type: String,
      ref: "User",
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

OrderSchema.index({ tableId: 1, status: 1 });
OrderSchema.index({ sessionId: 1, status: 1 });
OrderSchema.index({ status: 1, placedAt: -1 });
OrderSchema.index({ placedAt: -1 });

const Order = mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
