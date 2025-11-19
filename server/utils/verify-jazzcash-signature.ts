import crypto from "crypto";

export const verifyJazzCashSignature = (
  payload: any,
  secureHash: string
): boolean => {
  const integrityKey = process.env.JAZZCASH_INTEGRITY_KEY;
  if (!integrityKey) {
    console.error("[JazzCash] Integrity key not configured");
    return false;
  }

  const sortedParams = Object.keys(payload)
    .filter((key) => key !== "pp_SecureHash" && payload[key] !== "")
    .sort()
    .map((key) => payload[key])
    .join("&");

  const computedHash = crypto
    .createHmac("sha256", integrityKey)
    .update(sortedParams)
    .digest("hex")
    .toUpperCase();

  return crypto.timingSafeEqual(
    Buffer.from(secureHash.toUpperCase()),
    Buffer.from(computedHash)
  );
};
