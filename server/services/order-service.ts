import { IOrder, IOrderItem } from "../types/models-interfaces.js";
import { OrderStatusEnum } from "../enums/models-enums.js";

import { orderRepository } from "../repositories/order-repository.js";

import { tableSessionService } from "./table-session-service.js";
import { menuItemService } from "./menu-item-service.js";
import { tableService } from "./table-service.js";

import { ErrorHandler } from "../utils/error-handler.js";

export class OrderService {
  async createOrder(data: {
    tableId: string;
    sessionId: string;
    items: Array<{
      itemId: string;
      quantity: number;
      customizations?: string[];
    }>;
    specialInstructions?: string;
  }): Promise<IOrder> {
    const session = await tableSessionService.validateActiveSession(
      data.sessionId
    );

    if (session.tableId.toUpperCase() !== data.tableId.toUpperCase()) {
      throw new ErrorHandler("Session does not match table", 403);
    }

    await tableService.validateTableForSession(data.tableId);

    const orderItems: IOrderItem[] = [];
    let totalAmount = 0;

    for (const item of data.items) {
      const menuItem = await menuItemService.getMenuItemById(item.itemId);

      if (!menuItem.isAvailable) {
        throw new ErrorHandler(
          `Menu item "${menuItem.name}" is currently unavailable`,
          400
        );
      }

      const subtotal = menuItem.price * item.quantity;

      orderItems.push({
        itemId: menuItem.itemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        customizations: item.customizations || [],
        subtotal,
      });

      totalAmount += subtotal;
    }

    const order = await orderRepository.create({
      tableId: data.tableId,
      sessionId: data.sessionId,
      items: orderItems,
      specialInstructions: data.specialInstructions,
      totalAmount,
    });

    const table = await tableService.getTableById(data.tableId);
    if (table.status !== "OCCUPIED") {
      await tableService.markAsOccupied(data.tableId);
    }

    return order;
  }

  async getOrderById(orderId: string): Promise<IOrder> {
    const order = await orderRepository.findById(orderId);

    if (!order) {
      throw new ErrorHandler(`Order with ID ${orderId} not found`, 404);
    }

    return order;
  }

  async getAllOrders(): Promise<IOrder[]> {
    return await orderRepository.findAll();
  }

  async getOrdersByTable(tableId: string): Promise<IOrder[]> {
    await tableService.getTableById(tableId);
    return await orderRepository.findByTableId(tableId);
  }

  async getOrdersBySession(sessionId: string): Promise<IOrder[]> {
    await tableSessionService.getSessionById(sessionId);
    return await orderRepository.findBySessionId(sessionId);
  }

  async getActiveOrders(): Promise<IOrder[]> {
    return await orderRepository.findActiveOrders();
  }

  async getActiveOrdersByTable(tableId: string): Promise<IOrder[]> {
    await tableService.getTableById(tableId);
    return await orderRepository.findActiveOrdersByTable(tableId);
  }

  async getKitchenOrders(): Promise<IOrder[]> {
    return await orderRepository.findKitchenOrders();
  }

  async acceptOrder(
    orderId: string,
    acceptedBy: string,
    estimatedTime: number
  ): Promise<IOrder> {
    const order = await this.getOrderById(orderId);

    if (order.status !== OrderStatusEnum.PLACED) {
      throw new ErrorHandler(
        `Cannot accept order. Current status: ${order.status}`,
        400
      );
    }

    if (estimatedTime < 1 || estimatedTime > 180) {
      throw new ErrorHandler(
        "Estimated time must be between 1 and 180 minutes",
        400
      );
    }

    const updatedOrder = await orderRepository.acceptOrder(
      orderId,
      acceptedBy,
      estimatedTime
    );

    if (!updatedOrder) {
      throw new ErrorHandler("Failed to accept order", 500);
    }

    return updatedOrder;
  }

  async rejectOrder(
    orderId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<IOrder> {
    const order = await this.getOrderById(orderId);

    if (
      order.status !== OrderStatusEnum.PLACED &&
      order.status !== OrderStatusEnum.ACCEPTED
    ) {
      throw new ErrorHandler(
        `Cannot reject order. Current status: ${order.status}`,
        400
      );
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      throw new ErrorHandler("Rejection reason is required", 400);
    }

    const updatedOrder = await orderRepository.rejectOrder(
      orderId,
      rejectedBy,
      rejectionReason
    );

    if (!updatedOrder) {
      throw new ErrorHandler("Failed to reject order", 500);
    }

    return updatedOrder;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatusEnum
  ): Promise<IOrder> {
    const order = await this.getOrderById(orderId);

    this.validateStatusTransition(order.status, status);

    const updatedOrder = await orderRepository.updateStatus(orderId, status);

    if (!updatedOrder) {
      throw new ErrorHandler("Failed to update order status", 500);
    }

    return updatedOrder;
  }

  async cancelOrder(
    orderId: string,
    cancelledBy: string,
    cancellationReason: string
  ): Promise<IOrder> {
    const order = await this.getOrderById(orderId);

    if (
      order.status === OrderStatusEnum.SERVED ||
      order.status === OrderStatusEnum.REJECTED ||
      order.status === OrderStatusEnum.CANCELLED
    ) {
      throw new ErrorHandler(
        `Cannot cancel order. Current status: ${order.status}`,
        400
      );
    }

    if (!cancellationReason || cancellationReason.trim().length === 0) {
      throw new ErrorHandler("Cancellation reason is required", 400);
    }

    const updatedOrder = await orderRepository.cancelOrder(
      orderId,
      cancelledBy,
      cancellationReason
    );

    if (!updatedOrder) {
      throw new ErrorHandler("Failed to cancel order", 500);
    }

    return updatedOrder;
  }

  async getOrderStats(): Promise<{
    total: number;
    placed: number;
    accepted: number;
    inKitchen: number;
    ready: number;
    served: number;
    rejected: number;
    cancelled: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> {
    const [countByStatus, total, totalRevenue, averageOrderValue] =
      await Promise.all([
        orderRepository.getCountByStatus(),
        orderRepository.getTotalCount(),
        orderRepository.getTotalRevenue(),
        orderRepository.getAverageOrderValue(),
      ]);

    return {
      total,
      placed: countByStatus.placed || 0,
      accepted: countByStatus.accepted || 0,
      inKitchen: countByStatus.in_kitchen || 0,
      ready: countByStatus.ready || 0,
      served: countByStatus.served || 0,
      rejected: countByStatus.rejected || 0,
      cancelled: countByStatus.cancelled || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };
  }

  async getOrdersByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<IOrder[]> {
    return await orderRepository.getOrdersByDateRange(startDate, endDate);
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const revenue = await orderRepository.getRevenueByDateRange(
      startDate,
      endDate
    );
    return Math.round(revenue * 100) / 100;
  }

  private validateStatusTransition(
    currentStatus: OrderStatusEnum,
    newStatus: OrderStatusEnum
  ): void {
    const validTransitions: { [key: string]: OrderStatusEnum[] } = {
      [OrderStatusEnum.PLACED]: [
        OrderStatusEnum.ACCEPTED,
        OrderStatusEnum.REJECTED,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.ACCEPTED]: [
        OrderStatusEnum.IN_KITCHEN,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.IN_KITCHEN]: [
        OrderStatusEnum.READY,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.READY]: [
        OrderStatusEnum.SERVED,
        OrderStatusEnum.CANCELLED,
      ],
      [OrderStatusEnum.SERVED]: [],
      [OrderStatusEnum.REJECTED]: [],
      [OrderStatusEnum.CANCELLED]: [],
    };

    const allowedTransitions = validTransitions[currentStatus] || [];

    if (!allowedTransitions.includes(newStatus)) {
      throw new ErrorHandler(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }
  }
}

export const orderService = new OrderService();
