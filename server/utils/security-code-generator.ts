export const GenerateSecurityCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const ValidateSecurityCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

export const MaskSecurityCode = (code: string): string => {
  if (code.length !== 6) return "******";
  return `${code.substring(0, 2)}****`;
};

export const GenerateSecurityCodeWithExpiry = (): {
  code: string;
  expiresAt: Date;
} => {
  const code = GenerateSecurityCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return { code, expiresAt };
};
