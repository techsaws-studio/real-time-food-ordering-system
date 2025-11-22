import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

import { IMenuItem } from "../types/models-interfaces.js";
import { MenuItemTagEnum } from "../enums/models-enums.js";

const MenuItemSchema: Schema = new Schema(
  {
    itemId: {
      type: String,
      required: [true, "Item ID is required"],
      unique: true,
      default: () => crypto.randomUUID(),
    },

    categoryId: {
      type: String,
      required: [true, "Category ID is required"],
      ref: "Category",
    },

    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      minlength: [2, "Item name must be at least 2 characters"],
      maxlength: [200, "Item name cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: function (images: string[]) {
          return images.length <= 5;
        },
        message: "Cannot add more than 5 images",
      },
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    preparationTime: {
      type: Number,
      required: [true, "Preparation time is required"],
      min: [1, "Preparation time must be at least 1 minute"],
      max: [180, "Preparation time cannot exceed 180 minutes"],
      default: 15,
    },

    tags: {
      type: [String],
      enum: {
        values: Object.values(MenuItemTagEnum),
        message: "{VALUE} is not a valid tag",
      },
      default: [],
    },

    displayOrder: {
      type: Number,
      required: [true, "Display order is required"],
      min: [0, "Display order cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

MenuItemSchema.index({ categoryId: 1, displayOrder: 1 });
MenuItemSchema.index({ isAvailable: 1, categoryId: 1 });
MenuItemSchema.index({ name: "text", description: "text" });

const MenuItem = mongoose.model<IMenuItem>("MenuItem", MenuItemSchema);
export default MenuItem;
