import { Document } from "mongoose";

import {
  BillStatusEnum,
  MenuItemTagEnum,
  OrderStatusEnum,
  PaymentMethodEnum,
  PaymentStatusEnum,
  TableStatusEnum,
  UserRoleEnum,
} from "../enums/models-enums.js";

export interface ITable extends Document {
  tableId: string;
  tableNumber: number;
  capacity: number;
  status: TableStatusEnum;
  qrCodeUrl: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITableSession extends Document {
  sessionId: string;
  tableId: string;
  securityCode: string;
  deviceId: string;
  isActive: boolean;
  isVerified: boolean;
  verificationAttempts: number;
  maxVerificationAttempts: number;
  expiresAt: Date;
  verifiedAt: Date | null;
  endedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends Document {
  userId: string;
  email: string;
  password: string;
  role: UserRoleEnum;
  name: string;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Document {
  categoryId: string;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuItem extends Document {
  itemId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  isAvailable: boolean;
  preparationTime: number;
  tags: MenuItemTagEnum[];
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: string[];
  subtotal: number;
}

export interface IOrder extends Document {
  orderId: string;
  tableId: string;
  sessionId: string;
  items: IOrderItem[];
  status: OrderStatusEnum;
  specialInstructions?: string;
  estimatedTime: number | null;
  totalAmount: number;
  placedAt: Date;
  acceptedAt: Date | null;
  acceptedBy: string | null;
  inKitchenAt: Date | null;
  readyAt: Date | null;
  servedAt: Date | null;
  rejectedAt: Date | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBill extends Document {
  billId: string;
  tableId: string;
  sessionId: string;
  orders: string[];
  subtotal: number;
  tax: number;
  taxRate: number;
  serviceCharge: number;
  serviceChargeRate: number;
  discount: number;
  discountRate: number;
  promoCode: string | null;
  total: number;
  status: BillStatusEnum;
  createdAt: Date;
  paidAt: Date | null;
  closedAt: Date | null;
  closedBy: string | null;
  voidedAt: Date | null;
  voidedBy: string | null;
  voidReason: string | null;
  updatedAt: Date;
}

export interface IPayment extends Document {
  paymentId: string;
  billId: string;
  amount: number;
  method: PaymentMethodEnum;
  status: PaymentStatusEnum;
  transactionId: string | null;
  idempotencyKey: string;
  webhookVerified: boolean;
  paidAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;
  refundedAt: Date | null;
  refundReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}
