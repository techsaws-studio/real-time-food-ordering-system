import mongoose, { Schema } from "mongoose";

import { ITable } from "../types/models-interfaces.js";
import { TableStatusEnum } from "../enums/models-enums.js";

const TableSchema: Schema = new Schema(
  {
    tableId: {
      type: String,
      required: [true, "Table ID is required"],
      unique: true,
      uppercase: true,
      trim: true,
      match: [
        /^TBL[A-Z0-9]{5}$/,
        "Table ID must be alphanumeric format TBL + 5 characters",
      ],
    },

    tableNumber: {
      type: Number,
      required: [true, "Table number is required"],
      unique: true,
      min: [1, "Table number must be at least 1"],
      max: [100, "Table number cannot exceed 100"],
    },

    capacity: {
      type: Number,
      required: [true, "Table capacity is required"],
      min: [1, "Capacity must be at least 1"],
      max: [20, "Capacity cannot exceed 20"],
      default: 4,
    },

    status: {
      type: String,
      enum: {
        values: Object.values(TableStatusEnum),
        message: "{VALUE} is not a valid status",
      },
      default: TableStatusEnum.AVAILABLE,
      uppercase: true,
    },

    qrCodeUrl: {
      type: String,
      required: [true, "QR Code URL is required"],
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

TableSchema.index({ status: 1 });

const Table = mongoose.model<ITable>("Table", TableSchema);
export default Table;
