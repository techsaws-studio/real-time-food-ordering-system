import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import { paymentService } from "../services/payment-service.js";

import { paymentRepository } from "../repositories/payment-repository.js";

import { ApiResponse } from "../utils/api-response-formatter.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { ErrorHandler } from "../utils/error-handler.js";
import { verifyEasypaisaSignature } from "../utils/verify-easypaisa-signature.js";
import { verifyJazzCashSignature } from "../utils/verify-jazzcash-signature.js";
import { verifyMastercardSignature } from "../utils/verify-mastercard-signature.js";

export const HandleEasypaisaWebhook = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const webhookData = req.body;
    const signatureHeader = req.headers["x-easypaisa-signature"] as string;

    console.log("[Easypaisa Webhook] Received:", {
      transactionId: webhookData.transactionId,
      orderId: webhookData.orderId,
      status: webhookData.status,
      amount: webhookData.amount,
    });

    const signature = signatureHeader || webhookData.signature;
    if (!signature) {
      console.error("[Easypaisa] Missing webhook signature");
      throw new ErrorHandler("Missing webhook signature", 401);
    }

    const isValidSignature = verifyEasypaisaSignature(webhookData, signature);
    if (!isValidSignature) {
      console.error("[Easypaisa] Invalid webhook signature");
      throw new ErrorHandler("Invalid webhook signature", 401);
    }

    const payment = await paymentRepository.findById(webhookData.orderId);
    if (!payment) {
      console.error(`[Easypaisa] Payment not found: ${webhookData.orderId}`);
      return res.status(200).json({
        success: true,
        message: "Webhook received but payment not found",
      });
    }

    if (payment.amount !== webhookData.amount) {
      console.error(
        `[Easypaisa] Amount mismatch. Expected: ${payment.amount}, Received: ${webhookData.amount}`
      );
      throw new ErrorHandler("Payment amount mismatch", 400);
    }

    let result;
    if (webhookData.status === "success") {
      await paymentService.processPayment(
        payment.paymentId,
        webhookData.transactionId
      );
      result = await paymentService.confirmPayment(payment.paymentId, true);

      console.log(`[Easypaisa] Payment confirmed: ${payment.paymentId}`);
    } else if (webhookData.status === "failed") {
      result = await paymentService.failPayment(
        payment.paymentId,
        `Easypaisa: ${webhookData.responseMessage || "Payment failed"}`
      );

      console.log(`[Easypaisa] Payment failed: ${payment.paymentId}`);
    } else {
      console.log(
        `[Easypaisa] Payment status: ${webhookData.status} for ${payment.paymentId}`
      );
      return res.status(200).json({
        success: true,
        message: `Webhook acknowledged for status: ${webhookData.status}`,
      });
    }

    return res.status(200).json({
      success: true,
      paymentId: result.paymentId,
      status: result.status,
      message: "Webhook processed successfully",
    });
  }
);

export const HandleJazzCashWebhook = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const webhookData = req.body;

    console.log("[JazzCash Webhook] Received:", {
      txnRefNo: webhookData.pp_TxnRefNo,
      billReference: webhookData.pp_BillReference,
      responseCode: webhookData.pp_ResponseCode,
      amount: webhookData.pp_Amount,
    });

    if (!webhookData.pp_SecureHash) {
      console.error("[JazzCash] Missing secure hash");
      throw new ErrorHandler("Missing secure hash", 401);
    }

    const isValidHash = verifyJazzCashSignature(
      webhookData,
      webhookData.pp_SecureHash
    );
    if (!isValidHash) {
      console.error("[JazzCash] Invalid secure hash");
      throw new ErrorHandler("Invalid secure hash", 401);
    }

    const payment = await paymentRepository.findById(
      webhookData.pp_BillReference
    );
    if (!payment) {
      console.error(
        `[JazzCash] Payment not found: ${webhookData.pp_BillReference}`
      );
      return res.status(200).json({
        pp_ResponseCode: "000",
        pp_ResponseMessage: "Webhook received but payment not found",
      });
    }

    const webhookAmount = parseFloat(webhookData.pp_Amount);
    if (payment.amount !== webhookAmount) {
      console.error(
        `[JazzCash] Amount mismatch. Expected: ${payment.amount}, Received: ${webhookAmount}`
      );
      throw new ErrorHandler("Payment amount mismatch", 400);
    }

    let result;
    if (webhookData.pp_ResponseCode === "000") {
      await paymentService.processPayment(
        payment.paymentId,
        webhookData.pp_TxnRefNo
      );
      result = await paymentService.confirmPayment(payment.paymentId, true);

      console.log(`[JazzCash] Payment confirmed: ${payment.paymentId}`);
    } else {
      const failureMessage =
        webhookData.pp_ResponseMessage ||
        `JazzCash error code: ${webhookData.pp_ResponseCode}`;
      result = await paymentService.failPayment(
        payment.paymentId,
        failureMessage
      );

      console.log(`[JazzCash] Payment failed: ${payment.paymentId}`);
    }

    return res.status(200).json({
      pp_ResponseCode: "000",
      pp_ResponseMessage: "Webhook processed successfully",
      pp_BillReference: result.paymentId,
      pp_RetreivalReferenceNo: result.transactionId,
    });
  }
);

export const HandleMastercardWebhook = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const webhookData = req.body;
    const signature = req.headers["stripe-signature"] as string;

    console.log("[Mastercard/Stripe Webhook] Received:", {
      id: webhookData.id,
      type: webhookData.type,
      paymentId: webhookData.data?.object?.id,
    });

    if (signature) {
      const rawBody = JSON.stringify(req.body);
      const isValidSignature = verifyMastercardSignature(rawBody, signature);
      if (!isValidSignature) {
        console.error("[Mastercard/Stripe] Invalid webhook signature");
        throw new ErrorHandler("Invalid webhook signature", 401);
      }
    }

    const eventType = webhookData.type;
    const paymentData = webhookData.data?.object;

    if (!paymentData) {
      console.error("[Mastercard/Stripe] Missing payment data in webhook");
      throw new ErrorHandler("Invalid webhook payload", 400);
    }

    const paymentId =
      paymentData.metadata?.paymentId || paymentData.metadata?.billId;

    let payment = null;
    if (paymentId) {
      payment = await paymentRepository.findById(paymentId);
    }

    if (!payment && paymentData.id) {
      payment = await paymentRepository.findByTransactionId(paymentData.id);
    }

    if (!payment) {
      console.log(
        `[Mastercard/Stripe] Payment not found for webhook event: ${webhookData.id}`
      );
      return res.status(200).json({
        received: true,
        message: "Webhook acknowledged but payment not found",
      });
    }

    let result;
    switch (eventType) {
      case "payment_intent.succeeded":
      case "charge.succeeded":
        if (!payment.transactionId) {
          await paymentService.processPayment(
            payment.paymentId,
            paymentData.id
          );
        }
        result = await paymentService.confirmPayment(payment.paymentId, true);
        console.log(
          `[Mastercard/Stripe] Payment confirmed: ${payment.paymentId}`
        );
        break;

      case "payment_intent.payment_failed":
      case "charge.failed":
        const failureReason =
          paymentData.failure_message ||
          paymentData.last_payment_error?.message ||
          "Payment failed";
        result = await paymentService.failPayment(
          payment.paymentId,
          failureReason
        );
        console.log(`[Mastercard/Stripe] Payment failed: ${payment.paymentId}`);
        break;

      case "charge.refunded":
        const refundReason = "Refunded via Stripe dashboard";
        result = await paymentService.refundPayment(
          payment.paymentId,
          refundReason
        );
        console.log(
          `[Mastercard/Stripe] Payment refunded: ${payment.paymentId}`
        );
        break;

      default:
        console.log(
          `[Mastercard/Stripe] Unhandled event type: ${eventType} for ${payment.paymentId}`
        );
        return res.status(200).json({
          received: true,
          message: `Unhandled event type: ${eventType}`,
        });
    }

    return res.status(200).json({
      received: true,
      paymentId: result.paymentId,
      status: result.status,
      message: "Webhook processed successfully",
    });
  }
);

export const VerifyWebhookSignature = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { payload, signature, gateway } = req.body;

    let isValid = false;
    let parsedPayload;

    try {
      parsedPayload =
        typeof payload === "string" ? JSON.parse(payload) : payload;
    } catch (error) {
      throw new ErrorHandler("Invalid payload format", 400);
    }

    switch (gateway.toLowerCase()) {
      case "easypaisa":
        isValid = verifyEasypaisaSignature(parsedPayload, signature);
        break;

      case "jazzcash":
        isValid = verifyJazzCashSignature(parsedPayload, signature);
        break;

      case "mastercard":
        isValid = verifyMastercardSignature(payload, signature);
        break;

      default:
        throw new ErrorHandler(`Unknown gateway: ${gateway}`, 400);
    }

    return ApiResponse.success(
      res,
      {
        gateway,
        isValid,
        verifiedAt: new Date().toISOString(),
      },
      isValid ? "Signature is valid" : "Signature is invalid"
    );
  }
);

export const GetWebhookStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const gateways = {
      easypaisa: {
        configured: !!process.env.EASYPAISA_SECRET_KEY,
        webhookUrl: `${process.env.WEBHOOK_API_BASE_URL}/webhooks/easypaisa`,
      },
      jazzcash: {
        configured: !!process.env.JAZZCASH_INTEGRITY_KEY,
        webhookUrl: `${process.env.WEBHOOK_API_BASE_URL}/webhooks/jazzcash`,
      },
      mastercard: {
        configured: !!process.env.STRIPE_WEBHOOK_SECRET,
        webhookUrl: `${process.env.WEBHOOK_API_BASE_URL}/webhooks/mastercard`,
      },
    };

    const recentPayments = await paymentRepository.findByStatus(
      "SUCCEEDED" as any
    );
    const webhookVerifiedCount = recentPayments.filter(
      (p) => p.webhookVerified
    ).length;

    return ApiResponse.success(
      res,
      {
        gateways,
        statistics: {
          totalWebhookVerified: webhookVerifiedCount,
          lastVerifiedAt:
            recentPayments.find((p) => p.webhookVerified)?.paidAt || null,
        },
      },
      "Webhook status retrieved successfully"
    );
  }
);