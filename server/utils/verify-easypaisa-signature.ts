import crypto from "crypto";

export const verifyEasypaisaSignature = (
  payload: any,
  signature: string
): boolean => {
  const secretKey = process.env.EASYPAISA_SECRET_KEY;
  if (!secretKey) {
    console.error("[Easypaisa] Secret key not configured");
    return false;
  }

  const dataString = `${payload.transactionId}|${payload.orderId}|${payload.amount}|${payload.status}|${payload.timestamp}`;
  const computedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(dataString)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
};
