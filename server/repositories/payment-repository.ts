import { IPayment } from "../types/models-interfaces.js";
import { PaymentStatusEnum, PaymentMethodEnum } from "../enums/models-enums.js";

import Payment from "../models/payment-model.js";

export class PaymentRepository {
  async findById(paymentId: string): Promise<IPayment | null> {
    return await Payment.findOne({ paymentId });
  }

  async findByBillId(billId: string): Promise<IPayment[]> {
    return await Payment.find({ billId }).sort({ createdAt: -1 });
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<IPayment | null> {
    return await Payment.findOne({ idempotencyKey });
  }

  async findByTransactionId(transactionId: string): Promise<IPayment | null> {
    return await Payment.findOne({ transactionId });
  }

  async findByStatus(status: PaymentStatusEnum): Promise<IPayment[]> {
    return await Payment.find({ status }).sort({ createdAt: -1 });
  }

  async findPendingPayments(): Promise<IPayment[]> {
    return await Payment.find({
      status: {
        $in: [PaymentStatusEnum.PENDING, PaymentStatusEnum.PROCESSING],
      },
    }).sort({ createdAt: -1 });
  }

  async create(data: {
    billId: string;
    amount: number;
    method: PaymentMethodEnum;
    idempotencyKey: string;
  }): Promise<IPayment> {
    return await Payment.create(data);
  }

  async updateById(
    paymentId: string,
    updates: Partial<IPayment>
  ): Promise<IPayment | null> {
    return await Payment.findOneAndUpdate(
      { paymentId },
      { $set: updates },
      { new: true }
    );
  }

  async markAsProcessing(
    paymentId: string,
    transactionId: string
  ): Promise<IPayment | null> {
    return await Payment.findOneAndUpdate(
      { paymentId },
      {
        $set: {
          status: PaymentStatusEnum.PROCESSING,
          transactionId,
        },
      },
      { new: true }
    );
  }

  async markAsSucceeded(
    paymentId: string,
    webhookVerified: boolean = false
  ): Promise<IPayment | null> {
    return await Payment.findOneAndUpdate(
      { paymentId },
      {
        $set: {
          status: PaymentStatusEnum.SUCCEEDED,
          paidAt: new Date(),
          webhookVerified,
        },
      },
      { new: true }
    );
  }

  async markAsFailed(
    paymentId: string,
    failureReason: string
  ): Promise<IPayment | null> {
    return await Payment.findOneAndUpdate(
      { paymentId },
      {
        $set: {
          status: PaymentStatusEnum.FAILED,
          failedAt: new Date(),
          failureReason,
        },
      },
      { new: true }
    );
  }

  async markAsRefunded(
    paymentId: string,
    refundReason: string
  ): Promise<IPayment | null> {
    return await Payment.findOneAndUpdate(
      { paymentId },
      {
        $set: {
          status: PaymentStatusEnum.REFUNDED,
          refundedAt: new Date(),
          refundReason,
        },
      },
      { new: true }
    );
  }

  async deleteById(paymentId: string): Promise<IPayment | null> {
    return await Payment.findOneAndDelete({ paymentId });
  }

  async getTotalCount(): Promise<number> {
    return await Payment.countDocuments();
  }

  async getCountByStatus(): Promise<{ [key: string]: number }> {
    const stats = await Payment.aggregate([
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

  async getCountByMethod(): Promise<{ [key: string]: number }> {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
        },
      },
    ]);

    return stats.reduce((acc: any, curr: any) => {
      acc[curr._id.toLowerCase()] = curr.count;
      return acc;
    }, {});
  }

  async getPaymentsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<IPayment[]> {
    return await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });
  }
}

export const paymentRepository = new PaymentRepository();
