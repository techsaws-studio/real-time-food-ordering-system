import mongoose, { Schema } from "mongoose";
import crypto from "crypto";

import { ICategory } from "../types/models-interfaces.js";

const CategorySchema: Schema = new Schema(
  {
    categoryId: {
      type: String,
      required: [true, "Category ID is required"],
      unique: true,
      default: () => crypto.randomUUID(),
      index: true,
    },

    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [100, "Category name cannot exceed 100 characters"],
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },

    displayOrder: {
      type: Number,
      required: [true, "Display order is required"],
      min: [0, "Display order cannot be negative"],
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

CategorySchema.index({ categoryId: 1 });
CategorySchema.index({ isActive: 1, displayOrder: 1 });

const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;
