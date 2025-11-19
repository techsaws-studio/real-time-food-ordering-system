import { PaymentStatusEnum } from "../enums/models-enums.js";

export function getPaymentStatusMessage(status: PaymentStatusEnum): string {
  switch (status) {
    case PaymentStatusEnum.PENDING:
      return "Payment is awaiting processing";
    case PaymentStatusEnum.PROCESSING:
      return "Payment is being processed";
    case PaymentStatusEnum.SUCCEEDED:
      return "Payment completed successfully";
    case PaymentStatusEnum.FAILED:
      return "Payment failed. Please try again or use a different payment method.";
    case PaymentStatusEnum.REFUNDED:
      return "Payment has been refunded";
    default:
      return "Unknown payment status";
  }
}
