import { Socket } from "socket.io";

import {
  OrderStatusEnum,
  TableStatusEnum,
  UserRoleEnum,
} from "../enums/models-enums.js";

export interface OrderCreatedData {
  orderId: string;
  tableId: string;
  tableNumber: number;
  sessionId: string;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    price: number;
    customizations?: string;
    subtotal: number;
  }>;
  totalAmount: number;
  specialInstructions?: string;
  placedAt: string;
}

export interface OrderStatusChangedData {
  orderId: string;
  tableId: string;
  tableNumber: number;
  sessionId: string;
  oldStatus: OrderStatusEnum;
  newStatus: OrderStatusEnum;
  estimatedTime?: number;
  updatedAt: string;
  updatedBy?: string;
}

export interface OrderItemsUpdatedData {
  orderId: string;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    isAvailable: boolean;
  }>;
  unavailableItems?: string[];
  message?: string;
}

export interface KitchenOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  customizations?: string;
}

export interface KitchenOrder {
  orderId: string;
  tableNumber: number;
  tableId: string;
  items: KitchenOrderItem[];
  totalAmount: number;
  specialInstructions?: string;
  status: OrderStatusEnum;
  placedAt: string;
  estimatedTime?: number;
}

export interface KitchenStats {
  placedOrders: number;
  acceptedOrders: number;
  inKitchenOrders: number;
  readyOrders: number;
  averagePrepTime: number;
  timestamp: string;
}

export interface SessionCreatedData {
  sessionId: string;
  tableId: string;
  tableNumber: number;
  location: string;
  securityCode: string;
  expiresAt: string;
  createdBy: string;
  createdAt: string;
}

export interface SessionEndedData {
  sessionId: string;
  tableId: string;
  tableNumber: number;
  duration: number;
  endedAt: string;
  endedBy?: string;
  reason?: string;
}

export interface TableStatusChangedData {
  tableId: string;
  tableNumber: number;
  oldStatus: TableStatusEnum;
  newStatus: TableStatusEnum;
  reason?: string;
  changedAt: string;
}

export interface BillGeneratedData {
  billId: string;
  sessionId: string;
  tableId: string;
  tableNumber: number;
  subtotal: number;
  tax: number;
  discount: number;
  tip: number;
  total: number;
  generatedAt: string;
}

export interface BillUpdatedData {
  billId: string;
  sessionId: string;
  tableNumber: number;
  subtotal: number;
  tax: number;
  discount?: number;
  tip?: number;
  total: number;
  updatedAt: string;
  reason?: string;
}

export interface PaymentInitiatedData {
  billId: string;
  paymentId: string;
  sessionId: string;
  tableNumber: number;
  amount: number;
  method: string;
  initiatedAt: string;
}

export interface PaymentCompletedData {
  billId: string;
  paymentId: string;
  sessionId: string;
  tableNumber: number;
  amount: number;
  method: string;
  transactionId?: string;
  paidAt: string;
}

export interface GeneralNotification {
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | "URGENT";
  title: string;
  message: string;
  target: "customer" | "staff" | "kitchen" | "admin" | "all";
  sound?: boolean;
  actions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
  expiresAt?: string;
}

export interface AlertNotification {
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  category: "SYSTEM" | "SECURITY" | "OPERATIONAL" | "CUSTOMER_SERVICE";
  title: string;
  message: string;
  affectedArea?: string;
  actionRequired?: boolean;
  assignedTo?: string;
}

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  sessionId?: string;
  tableId?: string;
  role?: UserRoleEnum;
  deviceId?: string;
}
