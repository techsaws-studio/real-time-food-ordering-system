import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import crypto from "crypto";

import { PaymentStatusEnum, PaymentMethodEnum } from "../enums/models-enums.js";

import { GatewayConfigurations } from "../configs/gateway-configurations.js";

import { paymentService } from "../services/payment-service.js";
import { billService } from "../services/bill-service.js";

import { paymentRepository } from "../repositories/payment-repository.js";

import { ApiResponse } from "../utils/api-response-formatter.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { ErrorHandler } from "../utils/error-handler.js";
import { getPaymentStatusMessage } from "../utils/payment-status-message.js";

export const CreatePaymentIntent = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId, method, returnUrl, cancelUrl } = req.body;

    const { payment, idempotencyKey } =
      await paymentService.createPaymentIntent(
        billId,
        method as PaymentMethodEnum
      );

    const bill = await billService.getBillById(billId);

    const gatewayConfig = GatewayConfigurations(
      payment,
      method,
      returnUrl,
      cancelUrl
    );

    return ApiResponse.success(
      res,
      {
        paymentId: payment.paymentId,
        billId: payment.billId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        idempotencyKey,
        checkoutUrl: gatewayConfig.checkoutUrl,
        gatewayReference: gatewayConfig.reference,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        returnUrl: returnUrl || null,
        cancelUrl: cancelUrl || null,
        createdAt: payment.createdAt,
      },
      "Payment intent created successfully"
    );
  }
);

export const GetPaymentById = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;

    const payment = await paymentService.getPaymentById(paymentId);
    const bill = await billService.getBillById(payment.billId);

    return ApiResponse.success(
      res,
      {
        paymentId: payment.paymentId,
        billId: payment.billId,
        billTotal: bill.total,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        idempotencyKey: payment.idempotencyKey,
        webhookVerified: payment.webhookVerified,
        paidAt: payment.paidAt,
        failedAt: payment.failedAt,
        failureReason: payment.failureReason,
        refundedAt: payment.refundedAt,
        refundReason: payment.refundReason,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
      "Payment retrieved successfully"
    );
  }
);

export const GetPaymentByIdempotencyKey = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { idempotencyKey } = req.query;

    const payment = await paymentService.getPaymentByIdempotencyKey(
      idempotencyKey as string
    );

    return ApiResponse.success(
      res,
      {
        paymentId: payment.paymentId,
        billId: payment.billId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        webhookVerified: payment.webhookVerified,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      },
      "Payment retrieved successfully"
    );
  }
);

export const GetPaymentsByBill = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;
    const { status } = req.query;

    const bill = await billService.getBillById(billId);
    let payments = await paymentService.getPaymentsByBill(billId);

    if (status && typeof status === "string") {
      payments = payments.filter((payment) => payment.status === status);
    }

    const successfulPayment = payments.find(
      (p) => p.status === PaymentStatusEnum.SUCCEEDED
    );
    const totalPaid = successfulPayment ? successfulPayment.amount : 0;

    return ApiResponse.success(
      res,
      {
        billId: bill.billId,
        billTotal: bill.total,
        totalPaid,
        paymentsCount: payments.length,
        payments: payments.map((payment) => ({
          paymentId: payment.paymentId,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          transactionId: payment.transactionId,
          webhookVerified: payment.webhookVerified,
          paidAt: payment.paidAt,
          failedAt: payment.failedAt,
          failureReason: payment.failureReason,
          createdAt: payment.createdAt,
        })),
      },
      `Retrieved ${payments.length} payment(s) for bill`
    );
  }
);

export const GetPaymentsByStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.params;
    const { limit, offset } = req.query;

    const payments = await paymentRepository.findByStatus(
      status as PaymentStatusEnum
    );

    const limitNum = parseInt(limit as string, 10) || 50;
    const offsetNum = parseInt(offset as string, 10) || 0;
    const paginatedPayments = payments.slice(offsetNum, offsetNum + limitNum);

    return ApiResponse.success(
      res,
      {
        status,
        totalCount: payments.length,
        limit: limitNum,
        offset: offsetNum,
        payments: paginatedPayments.map((payment) => ({
          paymentId: payment.paymentId,
          billId: payment.billId,
          amount: payment.amount,
          method: payment.method,
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
          failedAt: payment.failedAt,
          createdAt: payment.createdAt,
        })),
      },
      `Retrieved ${paginatedPayments.length} payment(s) with status '${status}'`
    );
  }
);

export const GetPendingPayments = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { olderThan, limit } = req.query;

    let payments = await paymentService.getPendingPayments();

    if (olderThan) {
      const cutoffTime = new Date(
        Date.now() - parseInt(olderThan as string, 10) * 60 * 1000
      );
      payments = payments.filter(
        (payment) => new Date(payment.createdAt) < cutoffTime
      );
    }

    const limitNum = parseInt(limit as string, 10) || 50;
    const limitedPayments = payments.slice(0, limitNum);

    const paymentsWithAge = limitedPayments.map((payment) => {
      const ageMinutes = Math.floor(
        (Date.now() - new Date(payment.createdAt).getTime()) / 60000
      );
      return {
        paymentId: payment.paymentId,
        billId: payment.billId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        ageMinutes,
        isStale: ageMinutes > 30,
        createdAt: payment.createdAt,
      };
    });

    return ApiResponse.success(
      res,
      {
        totalCount: payments.length,
        returnedCount: paymentsWithAge.length,
        staleCount: paymentsWithAge.filter((p) => p.isStale).length,
        payments: paymentsWithAge,
      },
      `Retrieved ${paymentsWithAge.length} pending payment(s)`
    );
  }
);

export const ProcessPayment = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;
    const { transactionId, gatewayResponse } = req.body;

    const payment = await paymentService.processPayment(
      paymentId,
      transactionId
    );

    if (gatewayResponse) {
      console.log(`[Payment ${paymentId}] Gateway Response:`, gatewayResponse);
    }

    return ApiResponse.success(
      res,
      {
        paymentId: payment.paymentId,
        billId: payment.billId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        message: "Payment is being processed. Awaiting gateway confirmation.",
        updatedAt: payment.updatedAt,
      },
      "Payment processing initiated"
    );
  }
);

export const ConfirmPayment = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;
    const { webhookVerified } = req.body;

    const payment = await paymentService.confirmPayment(
      paymentId,
      webhookVerified || false
    );

    const bill = await billService.getBillById(payment.billId);

    return ApiResponse.success(
      res,
      {
        paymentId: payment.paymentId,
        billId: payment.billId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        transactionId: payment.transactionId,
        webhookVerified: payment.webhookVerified,
        paidAt: payment.paidAt,
        billStatus: bill.status,
      },
      "Payment confirmed successfully"
    );
  }
);

export const FailPayment = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;
    const { failureReason, errorCode, gatewayResponse } = req.body;

    const payment = await paymentService.failPayment(paymentId, failureReason);

    console.error(`[Payment ${paymentId}] Failed:`, {
      reason: failureReason,
      errorCode,
      gatewayResponse,
    });

    return ApiResponse.success(
      res,
      {
        paymentId: payment.paymentId,
        billId: payment.billId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        failureReason: payment.failureReason,
        failedAt: payment.failedAt,
        errorCode: errorCode || null,
        canRetry: true,
      },
      "Payment marked as failed"
    );
  }
);

export const RefundPayment = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;
    const { refundReason, refundAmount, refundedBy } = req.body;

    const payment = await paymentService.getPaymentById(paymentId);

    if (refundAmount && refundAmount > payment.amount) {
      throw new ErrorHandler(
        `Refund amount (${refundAmount}) cannot exceed payment amount (${payment.amount})`,
        400
      );
    }

    const refundedPayment = await paymentService.refundPayment(
      paymentId,
      refundReason
    );

    const gatewayRefundId = `REF_${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

    return ApiResponse.success(
      res,
      {
        paymentId: refundedPayment.paymentId,
        billId: refundedPayment.billId,
        originalAmount: refundedPayment.amount,
        refundAmount: refundAmount || refundedPayment.amount,
        isPartialRefund: refundAmount && refundAmount < refundedPayment.amount,
        method: refundedPayment.method,
        status: refundedPayment.status,
        refundReason: refundedPayment.refundReason,
        refundedAt: refundedPayment.refundedAt,
        refundedBy,
        gatewayRefundId,
      },
      "Payment refunded successfully"
    );
  }
);

export const CancelPayment = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;
    const { cancellationReason } = req.body;

    const payment = await paymentService.getPaymentById(paymentId);

    if (payment.status !== PaymentStatusEnum.PENDING) {
      throw new ErrorHandler(
        `Cannot cancel payment. Current status: ${payment.status}. Only PENDING payments can be cancelled.`,
        400
      );
    }

    const cancelledPayment = await paymentService.failPayment(
      paymentId,
      `Cancelled: ${cancellationReason}`
    );

    return ApiResponse.success(
      res,
      {
        paymentId: cancelledPayment.paymentId,
        billId: cancelledPayment.billId,
        amount: cancelledPayment.amount,
        method: cancelledPayment.method,
        status: cancelledPayment.status,
        cancellationReason,
        cancelledAt: cancelledPayment.failedAt,
        cancelledBy: req.user?.userId,
      },
      "Payment cancelled successfully"
    );
  }
);

export const RetryFailedPayment = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;
    const { newMethod } = req.body;

    const failedPayment = await paymentService.getPaymentById(paymentId);

    if (failedPayment.status !== PaymentStatusEnum.FAILED) {
      throw new ErrorHandler(
        `Cannot retry payment. Current status: ${failedPayment.status}. Only FAILED payments can be retried.`,
        400
      );
    }

    const method = newMethod || failedPayment.method;
    const { payment, idempotencyKey } =
      await paymentService.createPaymentIntent(failedPayment.billId, method);

    return ApiResponse.success(
      res,
      {
        originalPaymentId: failedPayment.paymentId,
        newPaymentId: payment.paymentId,
        billId: payment.billId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        idempotencyKey,
        message: "New payment intent created for retry",
        createdAt: payment.createdAt,
      },
      "Payment retry initiated successfully"
    );
  }
);

export const GetPaymentStats = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { period, groupBy, method } = req.query;

    const stats = await paymentService.getPaymentStats();

    const totalAttempts = stats.succeeded + stats.failed;
    const successRate =
      totalAttempts > 0
        ? Math.round((stats.succeeded / totalAttempts) * 10000) / 100
        : 0;

    const succeededPayments = await paymentRepository.findByStatus(
      PaymentStatusEnum.SUCCEEDED
    );
    const totalRevenue = succeededPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    let methodStats = stats.byMethod;
    if (method) {
      methodStats = {
        [method as string]: stats.byMethod[method as string] || 0,
      };
    }

    return ApiResponse.success(
      res,
      {
        period: period || "all",
        overview: {
          total: stats.total,
          pending: stats.pending,
          processing: stats.processing,
          succeeded: stats.succeeded,
          failed: stats.failed,
          refunded: stats.refunded,
        },
        metrics: {
          successRate: `${successRate}%`,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          averagePaymentValue:
            stats.succeeded > 0
              ? Math.round((totalRevenue / stats.succeeded) * 100) / 100
              : 0,
        },
        byMethod: methodStats,
      },
      "Payment statistics retrieved successfully"
    );
  }
);

export const GetPaymentsByDateRange = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate, method, status } = req.query;

    let payments = await paymentRepository.getPaymentsByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );

    if (method) {
      payments = payments.filter((p) => p.method === method);
    }
    if (status) {
      payments = payments.filter((p) => p.status === status);
    }

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const succeededAmount = payments
      .filter((p) => p.status === PaymentStatusEnum.SUCCEEDED)
      .reduce((sum, p) => sum + p.amount, 0);

    return ApiResponse.success(
      res,
      {
        dateRange: {
          startDate,
          endDate,
        },
        totalCount: payments.length,
        totalAmount: Math.round(totalAmount * 100) / 100,
        succeededAmount: Math.round(succeededAmount * 100) / 100,
        payments: payments.map((payment) => ({
          paymentId: payment.paymentId,
          billId: payment.billId,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        })),
      },
      `Retrieved ${payments.length} payment(s) in date range`
    );
  }
);

export const GetCustomerPaymentStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { paymentId } = req.params;

    const payment = await paymentService.getPaymentById(paymentId);

    return ApiResponse.success(
      res,
      {
        paymentId: payment.paymentId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        isPaid: payment.status === PaymentStatusEnum.SUCCEEDED,
        paidAt: payment.paidAt,
        message: getPaymentStatusMessage(payment.status),
      },
      "Payment status retrieved"
    );
  }
);

export const InitiateCustomerPayment = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session) {
      throw new ErrorHandler("Session not found", 401);
    }

    const { method } = req.body;

    const bill = await billService.getCurrentBillBySession(
      req.session.sessionId
    );

    if (bill.status === "PAID" || bill.status === "CLOSED") {
      throw new ErrorHandler("Bill is already paid or closed", 400);
    }

    const { payment, idempotencyKey } =
      await paymentService.createPaymentIntent(
        bill.billId,
        method as PaymentMethodEnum
      );

    const gatewayConfig = GatewayConfigurations(payment, method);

    return ApiResponse.success(
      res,
      {
        paymentId: payment.paymentId,
        amount: payment.amount,
        method: payment.method,
        checkoutUrl: gatewayConfig.checkoutUrl,
        idempotencyKey,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      "Payment initiated. Redirecting to payment gateway..."
    );
  }
);
