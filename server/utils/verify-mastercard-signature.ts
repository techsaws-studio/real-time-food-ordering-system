import crypto from "crypto";

export const verifyMastercardSignature = (
  payload: string,
  signature: string
): boolean => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Mastercard/Stripe] Webhook secret not configured");
    return false;
  }

  const signatureParts = signature.split(",");
  const timestampPart = signatureParts.find((part) => part.startsWith("t="));
  const signaturePart = signatureParts.find((part) => part.startsWith("v1="));

  if (!timestampPart || !signaturePart) {
    return false;
  }

  const timestamp = timestampPart.split("=")[1];
  const expectedSignature = signaturePart.split("=")[1];

  const timestampAge = Date.now() / 1000 - parseInt(timestamp, 10);
  if (timestampAge > 300) {
    console.error("[Mastercard/Stripe] Webhook timestamp too old");
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const computedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(computedSignature)
  );
};
