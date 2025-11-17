import { IBill } from "../types/models-interfaces.js";
import { BillStatusEnum } from "../enums/models-enums.js";

import Bill from "../models/bill-model.js";

export class BillRepository {
  async findById(billId: string): Promise<IBill | null> {
    return await Bill.findOne({ billId });
  }

  async findAll(): Promise<IBill[]> {
    return await Bill.find().sort({ createdAt: -1 });
  }

  async findByTableId(tableId: string): Promise<IBill[]> {
    return await Bill.find({ tableId: tableId.toUpperCase() }).sort({
      createdAt: -1,
    });
  }

  async findBySessionId(sessionId: string): Promise<IBill[]> {
    return await Bill.find({ sessionId }).sort({ createdAt: -1 });
  }

  async findCurrentBillBySession(sessionId: string): Promise<IBill | null> {
    return await Bill.findOne({
      sessionId,
      status: { $in: [BillStatusEnum.OPEN, BillStatusEnum.PENDING_PAYMENT] },
    });
  }

  async findByStatus(status: BillStatusEnum): Promise<IBill[]> {
    return await Bill.find({ status }).sort({ createdAt: -1 });
  }

  async create(data: {
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
    promoCode?: string;
    total: number;
  }): Promise<IBill> {
    return await Bill.create({
      tableId: data.tableId.toUpperCase(),
      sessionId: data.sessionId,
      orders: data.orders,
      subtotal: data.subtotal,
      tax: data.tax,
      taxRate: data.taxRate,
      serviceCharge: data.serviceCharge,
      serviceChargeRate: data.serviceChargeRate,
      discount: data.discount,
      discountRate: data.discountRate,
      promoCode: data.promoCode,
      total: data.total,
    });
  }

  async updateById(
    billId: string,
    updates: Partial<IBill>
  ): Promise<IBill | null> {
    return await Bill.findOneAndUpdate(
      { billId },
      { $set: updates },
      { new: true }
    );
  }

  async addOrderToBill(billId: string, orderId: string): Promise<IBill | null> {
    return await Bill.findOneAndUpdate(
      { billId },
      { $addToSet: { orders: orderId } },
      { new: true }
    );
  }

  async applyPromoCode(
    billId: string,
    promoCode: string,
    discount: number,
    discountRate: number,
    newTotal: number
  ): Promise<IBill | null> {
    return await Bill.findOneAndUpdate(
      { billId },
      {
        $set: {
          promoCode,
          discount,
          discountRate,
          total: newTotal,
        },
      },
      { new: true }
    );
  }

  async markAsPendingPayment(billId: string): Promise<IBill | null> {
    return await Bill.findOneAndUpdate(
      { billId },
      { $set: { status: BillStatusEnum.PENDING_PAYMENT } },
      { new: true }
    );
  }

  async markAsPaid(billId: string): Promise<IBill | null> {
    return await Bill.findOneAndUpdate(
      { billId },
      {
        $set: {
          status: BillStatusEnum.PAID,
          paidAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async closeBill(billId: string, closedBy: string): Promise<IBill | null> {
    return await Bill.findOneAndUpdate(
      { billId },
      {
        $set: {
          status: BillStatusEnum.CLOSED,
          closedAt: new Date(),
          closedBy,
        },
      },
      { new: true }
    );
  }

  async voidBill(
    billId: string,
    voidedBy: string,
    voidReason: string
  ): Promise<IBill | null> {
    return await Bill.findOneAndUpdate(
      { billId },
      {
        $set: {
          status: BillStatusEnum.VOID,
          voidedAt: new Date(),
          voidedBy,
          voidReason,
        },
      },
      { new: true }
    );
  }

  async deleteById(billId: string): Promise<IBill | null> {
    return await Bill.findOneAndDelete({ billId });
  }

  async getTotalCount(): Promise<number> {
    return await Bill.countDocuments();
  }

  async getCountByStatus(): Promise<{ [key: string]: number }> {
    const stats = await Bill.aggregate([
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

  async getBillsByDateRange(startDate: Date, endDate: Date): Promise<IBill[]> {
    return await Bill.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });
  }

  async getTotalRevenue(): Promise<number> {
    const result = await Bill.aggregate([
      {
        $match: {
          status: { $in: [BillStatusEnum.PAID, BillStatusEnum.CLOSED] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const result = await Bill.aggregate([
      {
        $match: {
          status: { $in: [BillStatusEnum.PAID, BillStatusEnum.CLOSED] },
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }

  async getAverageBillValue(): Promise<number> {
    const result = await Bill.aggregate([
      {
        $match: {
          status: { $in: [BillStatusEnum.PAID, BillStatusEnum.CLOSED] },
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$total" },
        },
      },
    ]);

    return result.length > 0 ? result[0].average : 0;
  }
}

export const billRepository = new BillRepository();
