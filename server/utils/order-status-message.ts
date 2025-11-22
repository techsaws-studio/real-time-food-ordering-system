import { OrderStatusEnum } from "../enums/models-enums.js";

export function getOrderStatusMessage(status: OrderStatusEnum): string {
  const messages: Record<OrderStatusEnum, string> = {
    [OrderStatusEnum.PLACED]:
      "Your order has been placed and is awaiting kitchen confirmation",
    [OrderStatusEnum.ACCEPTED]: "Your order has been accepted by the kitchen",
    [OrderStatusEnum.IN_KITCHEN]:
      "Your order is being prepared by our kitchen staff",
    [OrderStatusEnum.READY]: "Your order is ready! 🎉",
    [OrderStatusEnum.SERVED]: "Enjoy your meal! 🍽️",
    [OrderStatusEnum.REJECTED]: "Your order has been rejected",
    [OrderStatusEnum.CANCELLED]: "Your order has been cancelled",
  };

  return messages[status] || "Order status updated";
}
