import crypto from "crypto";

import { IPayment } from "../types/models-interfaces.js";
import { PaymentMethodEnum, PaymentStatusEnum } from "../enums/models-enums.js";

import { paymentRepository } from "../repositories/payment-repository.js";

import { billService } from "./bill-service.js";

import { ErrorHandler } from "../utils/error-handler.js";

export class PaymentService {
  async createPaymentIntent(
    billId: string,
    method: PaymentMethodEnum
  ): Promise<{ payment: IPayment; idempotencyKey: string }> {
    const bill = await billService.getBillById(billId);

    if (bill.status !== "OPEN" && bill.status !== "PENDING_PAYMENT") {
      throw new ErrorHandler(
        `Cannot create payment. Bill status: ${bill.status}`,
        400
      );
    }

    const idempotencyKey = crypto.randomUUID();

    const existingPayment = await paymentRepository.findByIdempotencyKey(
      idempotencyKey
    );
    if (existingPayment) {
      throw new ErrorHandler("Payment already exists for this request", 400);
    }

    const payment = await paymentRepository.create({
      billId,
      amount: bill.total,
      method,
      idempotencyKey,
    });

    await billService.markAsPendingPayment(billId);

    return { payment, idempotencyKey };
  }

  async processPayment(
    paymentId: string,
    transactionId: string
  ): Promise<IPayment> {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status !== PaymentStatusEnum.PENDING) {
      throw new ErrorHandler(
        `Cannot process payment. Current status: ${payment.status}`,
        400
      );
    }

    const updatedPayment = await paymentRepository.markAsProcessing(
      paymentId,
      transactionId
    );

    if (!updatedPayment) {
      throw new ErrorHandler("Failed to process payment", 500);
    }

    return updatedPayment;
  }

  async confirmPayment(
    paymentId: string,
    webhookVerified: boolean = false
  ): Promise<IPayment> {
    const payment = await this.getPaymentById(paymentId);

    if (
      payment.status !== PaymentStatusEnum.PENDING &&
      payment.status !== PaymentStatusEnum.PROCESSING
    ) {
      throw new ErrorHandler(
        `Cannot confirm payment. Current status: ${payment.status}`,
        400
      );
    }

    const updatedPayment = await paymentRepository.markAsSucceeded(
      paymentId,
      webhookVerified
    );

    if (!updatedPayment) {
      throw new ErrorHandler("Failed to confirm payment", 500);
    }

    await billService.markAsPaid(payment.billId);

    return updatedPayment;
  }

  async failPayment(
    paymentId: string,
    failureReason: string
  ): Promise<IPayment> {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status === PaymentStatusEnum.SUCCEEDED) {
      throw new ErrorHandler("Cannot fail a succeeded payment", 400);
    }

    const updatedPayment = await paymentRepository.markAsFailed(
      paymentId,
      failureReason
    );

    if (!updatedPayment) {
      throw new ErrorHandler("Failed to mark payment as failed", 500);
    }

    return updatedPayment;
  }

  async refundPayment(
    paymentId: string,
    refundReason: string
  ): Promise<IPayment> {
    const payment = await this.getPaymentById(paymentId);

    if (payment.status !== PaymentStatusEnum.SUCCEEDED) {
      throw new ErrorHandler("Can only refund succeeded payments", 400);
    }

    if (!refundReason || refundReason.trim().length === 0) {
      throw new ErrorHandler("Refund reason is required", 400);
    }

    const updatedPayment = await paymentRepository.markAsRefunded(
      paymentId,
      refundReason
    );

    if (!updatedPayment) {
      throw new ErrorHandler("Failed to refund payment", 500);
    }

    return updatedPayment;
  }

  async getPaymentById(paymentId: string): Promise<IPayment> {
    const payment = await paymentRepository.findById(paymentId);

    if (!payment) {
      throw new ErrorHandler(`Payment with ID ${paymentId} not found`, 404);
    }

    return payment;
  }

  async getPaymentByIdempotencyKey(idempotencyKey: string): Promise<IPayment> {
    const payment = await paymentRepository.findByIdempotencyKey(
      idempotencyKey
    );

    if (!payment) {
      throw new ErrorHandler(`Payment with idempotency key not found`, 404);
    }

    return payment;
  }

  async getPaymentsByBill(billId: string): Promise<IPayment[]> {
    await billService.getBillById(billId); // Verify bill exists
    return await paymentRepository.findByBillId(billId);
  }

  async getPendingPayments(): Promise<IPayment[]> {
    return await paymentRepository.findPendingPayments();
  }

  async getPaymentStats(): Promise<{
    total: number;
    pending: number;
    processing: number;
    succeeded: number;
    failed: number;
    refunded: number;
    byMethod: { [key: string]: number };
  }> {
    const [countByStatus, countByMethod, total] = await Promise.all([
      paymentRepository.getCountByStatus(),
      paymentRepository.getCountByMethod(),
      paymentRepository.getTotalCount(),
    ]);

    return {
      total,
      pending: countByStatus.pending || 0,
      processing: countByStatus.processing || 0,
      succeeded: countByStatus.succeeded || 0,
      failed: countByStatus.failed || 0,
      refunded: countByStatus.refunded || 0,
      byMethod: countByMethod,
    };
  }

  async handleWebhook(data: {
    transactionId: string;
    status: "success" | "failed";
    failureReason?: string;
  }): Promise<IPayment> {
    const payment = await paymentRepository.findByTransactionId(
      data.transactionId
    );

    if (!payment) {
      throw new ErrorHandler(
        `Payment with transaction ID ${data.transactionId} not found`,
        404
      );
    }

    if (data.status === "success") {
      return await this.confirmPayment(payment.paymentId, true);
    } else {
      return await this.failPayment(
        payment.paymentId,
        data.failureReason || "Payment failed at gateway"
      );
    }
  }
}

export const paymentService = new PaymentService();
