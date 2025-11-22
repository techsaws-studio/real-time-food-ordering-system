export function getAttentionMessage(
  tableNumber: number,
  reason: "ASSISTANCE" | "REFILL" | "COMPLAINT" | "PAYMENT" | "OTHER"
): string {
  const messages = {
    ASSISTANCE: `Table ${tableNumber} needs assistance`,
    REFILL: `Table ${tableNumber} requests a refill`,
    COMPLAINT: `⚠️ URGENT: Table ${tableNumber} has a complaint`,
    PAYMENT: `Table ${tableNumber} is ready to pay`,
    OTHER: `Table ${tableNumber} requires attention`,
  };

  return messages[reason] || `Table ${tableNumber} needs attention`;
}
