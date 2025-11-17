import { IOrder, IOrderItem } from "../types/models-interfaces.js";
import { OrderStatusEnum } from "../enums/models-enums.js";

import Order from "../models/order-model.js";

export class OrderRepository {
  async findById(orderId: string): Promise<IOrder | null> {
    return await Order.findOne({ orderId });
  }

  async findAll(): Promise<IOrder[]> {
    return await Order.find().sort({ placedAt: -1 });
  }

  async findByTableId(tableId: string): Promise<IOrder[]> {
    return await Order.find({ tableId: tableId.toUpperCase() }).sort({
      placedAt: -1,
    });
  }

  async findBySessionId(sessionId: string): Promise<IOrder[]> {
    return await Order.find({ sessionId }).sort({ placedAt: -1 });
  }

  async findByStatus(status: OrderStatusEnum): Promise<IOrder[]> {
    return await Order.find({ status }).sort({ placedAt: -1 });
  }

  async findActiveOrders(): Promise<IOrder[]> {
    return await Order.find({
      status: {
        $in: [
          OrderStatusEnum.PLACED,
          OrderStatusEnum.ACCEPTED,
          OrderStatusEnum.IN_KITCHEN,
          OrderStatusEnum.READY,
        ],
      },
    }).sort({ placedAt: 1 });
  }

  async findActiveOrdersByTable(tableId: string): Promise<IOrder[]> {
    return await Order.find({
      tableId: tableId.toUpperCase(),
      status: {
        $in: [
          OrderStatusEnum.PLACED,
          OrderStatusEnum.ACCEPTED,
          OrderStatusEnum.IN_KITCHEN,
          OrderStatusEnum.READY,
        ],
      },
    }).sort({ placedAt: 1 });
  }

  async findKitchenOrders(): Promise<IOrder[]> {
    return await Order.find({
      status: {
        $in: [
          OrderStatusEnum.PLACED,
          OrderStatusEnum.ACCEPTED,
          OrderStatusEnum.IN_KITCHEN,
        ],
      },
    }).sort({ placedAt: 1 });
  }

  async create(data: {
    tableId: string;
    sessionId: string;
    items: IOrderItem[];
    specialInstructions?: string;
    totalAmount: number;
  }): Promise<IOrder> {
    return await Order.create({
      tableId: data.tableId.toUpperCase(),
      sessionId: data.sessionId,
      items: data.items,
      specialInstructions: data.specialInstructions,
      totalAmount: data.totalAmount,
    });
  }

  async updateStatus(
    orderId: string,
    status: OrderStatusEnum
  ): Promise<IOrder | null> {
    const updates: any = { status };

    if (status === OrderStatusEnum.ACCEPTED) {
      updates.acceptedAt = new Date();
    } else if (status === OrderStatusEnum.IN_KITCHEN) {
      updates.inKitchenAt = new Date();
    } else if (status === OrderStatusEnum.READY) {
      updates.readyAt = new Date();
    } else if (status === OrderStatusEnum.SERVED) {
      updates.servedAt = new Date();
    }

    return await Order.findOneAndUpdate(
      { orderId },
      { $set: updates },
      { new: true }
    );
  }

  async acceptOrder(
    orderId: string,
    acceptedBy: string,
    estimatedTime: number
  ): Promise<IOrder | null> {
    return await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          status: OrderStatusEnum.ACCEPTED,
          acceptedBy,
          acceptedAt: new Date(),
          estimatedTime,
        },
      },
      { new: true }
    );
  }

  async rejectOrder(
    orderId: string,
    rejectedBy: string,
    rejectionReason: string
  ): Promise<IOrder | null> {
    return await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          status: OrderStatusEnum.REJECTED,
          rejectedBy,
          rejectedAt: new Date(),
          rejectionReason,
        },
      },
      { new: true }
    );
  }

  async cancelOrder(
    orderId: string,
    cancelledBy: string,
    cancellationReason: string
  ): Promise<IOrder | null> {
    return await Order.findOneAndUpdate(
      { orderId },
      {
        $set: {
          status: OrderStatusEnum.CANCELLED,
          cancelledBy,
          cancelledAt: new Date(),
          cancellationReason,
        },
      },
      { new: true }
    );
  }

  async deleteById(orderId: string): Promise<IOrder | null> {
    return await Order.findOneAndDelete({ orderId });
  }

  async getTotalCount(): Promise<number> {
    return await Order.countDocuments();
  }

  async getCountByStatus(): Promise<{ [key: string]: number }> {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return stats.reduce((acc: any, curr: any) => {
      acc[curr._id.toLowerCase()] = curr.count;
      return acc;
    }, {});
  }

  async getOrdersByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<IOrder[]> {
    return await Order.find({
      placedAt: { $gte: startDate, $lte: endDate },
    }).sort({ placedAt: -1 });
  }

  async getTotalRevenue(): Promise<number> {
    const result = await Order.aggregate([
      {
        $match: { status: OrderStatusEnum.SERVED },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const result = await Order.aggregate([
      {
        $match: {
          status: OrderStatusEnum.SERVED,
          placedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getAverageOrderValue(): Promise<number> {
    const result = await Order.aggregate([
      {
        $match: { status: OrderStatusEnum.SERVED },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$totalAmount" },
        },
      },
    ]);

    return result.length > 0 ? result[0].average : 0;
  }
}

export const orderRepository = new OrderRepository();
