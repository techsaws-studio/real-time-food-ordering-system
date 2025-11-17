export const GenerateAlphanumericTableId = (tableNumber: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";

  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `TBL${randomPart}`;
};

export const GenerateReadableTableId = (tableNumber: number): string => {
  const paddedNumber = tableNumber.toString().padStart(2, "0");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomPart = "";

  for (let i = 0; i < 3; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `TBL${paddedNumber}${randomPart}`;
};
