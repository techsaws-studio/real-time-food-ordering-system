import { PaymentMethodEnum } from "../enums/models-enums.js";

export function GatewayConfigurations(
  payment: any,
  method: string,
  returnUrl?: string,
  cancelUrl?: string
): { checkoutUrl: string; reference: string } {
  const baseUrl =
    process.env.PAYMENT_GATEWAY_URL || "https://payment.example.com";
  const merchantId = process.env.MERCHANT_ID || "RTFOS_001";

  switch (method.toUpperCase()) {
    case PaymentMethodEnum.EASYPAISA:
      return {
        checkoutUrl: `${
          process.env.EASYPAISA_CHECKOUT_URL || "https://easypaisa.com/checkout"
        }?orderId=${payment.paymentId}&amount=${
          payment.amount
        }&merchantId=${merchantId}`,
        reference: `EP_${payment.paymentId.slice(0, 8)}`,
      };

    case PaymentMethodEnum.JAZZCASH:
      return {
        checkoutUrl: `${
          process.env.JAZZCASH_CHECKOUT_URL || "https://jazzcash.com/checkout"
        }?txnRefNo=${payment.paymentId}&amount=${
          payment.amount
        }&merchantId=${merchantId}`,
        reference: `JC_${payment.paymentId.slice(0, 8)}`,
      };

    case PaymentMethodEnum.MASTERCARD:
    case PaymentMethodEnum.DEBIT_CARD:
      return {
        checkoutUrl: `${
          process.env.CARD_CHECKOUT_URL || "https://checkout.stripe.com"
        }/pay/${payment.paymentId}?return_url=${encodeURIComponent(
          returnUrl || ""
        )}`,
        reference: `CARD_${payment.paymentId.slice(0, 8)}`,
      };

    case PaymentMethodEnum.CASH:
      return {
        checkoutUrl: "",
        reference: `CASH_${payment.paymentId.slice(0, 8)}`,
      };

    default:
      return {
        checkoutUrl: `${baseUrl}/checkout/${payment.paymentId}`,
        reference: `REF_${payment.paymentId.slice(0, 8)}`,
      };
  }
}
