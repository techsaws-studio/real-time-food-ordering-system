import { BillStatusEnum } from "../enums/models-enums.js";
import { IBill } from "../types/models-interfaces.js";

import { billRepository } from "../repositories/bill-repository.js";
import { orderRepository } from "../repositories/order-repository.js";

import { tableService } from "./table-service.js";
import { tableSessionService } from "./table-session-service.js";

import { ErrorHandler } from "../utils/error-handler.js";

export class BillService {
  private readonly DEFAULT_TAX_RATE = 16; // 16% GST
  private readonly DEFAULT_SERVICE_CHARGE_RATE = 10; // 10% service charge

  async createOrGetBill(tableId: string, sessionId: string): Promise<IBill> {
    const session = await tableSessionService.validateActiveSession(sessionId);

    if (session.tableId.toUpperCase() !== tableId.toUpperCase()) {
      throw new ErrorHandler("Session does not match table", 403);
    }

    const existingBill = await billRepository.findCurrentBillBySession(
      sessionId
    );
    if (existingBill) {
      return existingBill;
    }

    const orders = await orderRepository.findBySessionId(sessionId);

    if (orders.length === 0) {
      throw new ErrorHandler("No orders found for this session", 400);
    }

    const subtotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const tax = (subtotal * this.DEFAULT_TAX_RATE) / 100;
    const serviceCharge = (subtotal * this.DEFAULT_SERVICE_CHARGE_RATE) / 100;
    const total = subtotal + tax + serviceCharge;

    const bill = await billRepository.create({
      tableId,
      sessionId,
      orders: orders.map((order) => order.orderId),
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      taxRate: this.DEFAULT_TAX_RATE,
      serviceCharge: Math.round(serviceCharge * 100) / 100,
      serviceChargeRate: this.DEFAULT_SERVICE_CHARGE_RATE,
      discount: 0,
      discountRate: 0,
      total: Math.round(total * 100) / 100,
    });

    return bill;
  }

  async getBillById(billId: string): Promise<IBill> {
    const bill = await billRepository.findById(billId);

    if (!bill) {
      throw new ErrorHandler(`Bill with ID ${billId} not found`, 404);
    }

    return bill;
  }

  async getCurrentBillBySession(sessionId: string): Promise<IBill> {
    const bill = await billRepository.findCurrentBillBySession(sessionId);

    if (!bill) {
      throw new ErrorHandler("No current bill found for this session", 404);
    }

    return bill;
  }

  async getBillsByTable(tableId: string): Promise<IBill[]> {
    await tableService.getTableById(tableId); // Verify table exists
    return await billRepository.findByTableId(tableId);
  }

  async addOrderToBill(billId: string, orderId: string): Promise<IBill> {
    const bill = await this.getBillById(billId);

    if (bill.status !== BillStatusEnum.OPEN) {
      throw new ErrorHandler(
        `Cannot add order to bill. Current status: ${bill.status}`,
        400
      );
    }

    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new ErrorHandler(`Order with ID ${orderId} not found`, 404);
    }

    if (order.sessionId !== bill.sessionId) {
      throw new ErrorHandler(
        "Order does not belong to this bill's session",
        400
      );
    }

    const updatedBill = await billRepository.addOrderToBill(billId, orderId);

    if (!updatedBill) {
      throw new ErrorHandler("Failed to add order to bill", 500);
    }

    return await this.recalculateBill(billId);
  }

  async applyPromoCode(billId: string, promoCode: string): Promise<IBill> {
    const bill = await this.getBillById(billId);

    if (bill.status !== BillStatusEnum.OPEN) {
      throw new ErrorHandler(
        `Cannot apply promo code. Current status: ${bill.status}`,
        400
      );
    }

    const discountRate = this.validatePromoCode(promoCode);

    const discount = (bill.subtotal * discountRate) / 100;
    const newTotal = bill.subtotal + bill.tax + bill.serviceCharge - discount;

    const updatedBill = await billRepository.applyPromoCode(
      billId,
      promoCode,
      Math.round(discount * 100) / 100,
      discountRate,
      Math.round(newTotal * 100) / 100
    );

    if (!updatedBill) {
      throw new ErrorHandler("Failed to apply promo code", 500);
    }

    return updatedBill;
  }

  async markAsPendingPayment(billId: string): Promise<IBill> {
    const bill = await this.getBillById(billId);

    if (bill.status !== BillStatusEnum.OPEN) {
      throw new ErrorHandler(
        `Cannot mark as pending payment. Current status: ${bill.status}`,
        400
      );
    }

    const updatedBill = await billRepository.markAsPendingPayment(billId);

    if (!updatedBill) {
      throw new ErrorHandler("Failed to mark bill as pending payment", 500);
    }

    return updatedBill;
  }

  async markAsPaid(billId: string): Promise<IBill> {
    const bill = await this.getBillById(billId);

    if (
      bill.status !== BillStatusEnum.OPEN &&
      bill.status !== BillStatusEnum.PENDING_PAYMENT
    ) {
      throw new ErrorHandler(
        `Cannot mark as paid. Current status: ${bill.status}`,
        400
      );
    }

    const updatedBill = await billRepository.markAsPaid(billId);

    if (!updatedBill) {
      throw new ErrorHandler("Failed to mark bill as paid", 500);
    }

    return updatedBill;
  }

  async closeBill(billId: string, closedBy: string): Promise<IBill> {
    const bill = await this.getBillById(billId);

    if (bill.status !== BillStatusEnum.PAID) {
      throw new ErrorHandler(
        `Cannot close bill. Must be paid first. Current status: ${bill.status}`,
        400
      );
    }

    const updatedBill = await billRepository.closeBill(billId, closedBy);

    if (!updatedBill) {
      throw new ErrorHandler("Failed to close bill", 500);
    }

    await tableSessionService.endSession(bill.sessionId);
    await tableService.markAsAvailable(bill.tableId);

    return updatedBill;
  }

  async voidBill(
    billId: string,
    voidedBy: string,
    voidReason: string
  ): Promise<IBill> {
    const bill = await this.getBillById(billId);

    if (
      bill.status === BillStatusEnum.CLOSED ||
      bill.status === BillStatusEnum.VOID
    ) {
      throw new ErrorHandler(
        `Cannot void bill. Current status: ${bill.status}`,
        400
      );
    }

    if (!voidReason || voidReason.trim().length === 0) {
      throw new ErrorHandler("Void reason is required", 400);
    }

    const updatedBill = await billRepository.voidBill(
      billId,
      voidedBy,
      voidReason
    );

    if (!updatedBill) {
      throw new ErrorHandler("Failed to void bill", 500);
    }

    return updatedBill;
  }

  async getBillStats(): Promise<{
    total: number;
    open: number;
    pendingPayment: number;
    paid: number;
    closed: number;
    void: number;
    totalRevenue: number;
    averageBillValue: number;
  }> {
    const [countByStatus, total, totalRevenue, averageBillValue] =
      await Promise.all([
        billRepository.getCountByStatus(),
        billRepository.getTotalCount(),
        billRepository.getTotalRevenue(),
        billRepository.getAverageBillValue(),
      ]);

    return {
      total,
      open: countByStatus.open || 0,
      pendingPayment: countByStatus.pending_payment || 0,
      paid: countByStatus.paid || 0,
      closed: countByStatus.closed || 0,
      void: countByStatus.void || 0,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageBillValue: Math.round(averageBillValue * 100) / 100,
    };
  }

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const revenue = await billRepository.getRevenueByDateRange(
      startDate,
      endDate
    );
    return Math.round(revenue * 100) / 100;
  }

  private async recalculateBill(billId: string): Promise<IBill> {
    const bill = await this.getBillById(billId);

    const orders = await Promise.all(
      bill.orders.map((orderId) => orderRepository.findById(orderId))
    );

    const validOrders = orders.filter((order) => order !== null);
    const subtotal = validOrders.reduce(
      (sum, order) => sum + (order?.totalAmount || 0),
      0
    );

    const tax = (subtotal * bill.taxRate) / 100;
    const serviceCharge = (subtotal * bill.serviceChargeRate) / 100;
    const discount = (subtotal * bill.discountRate) / 100;
    const total = subtotal + tax + serviceCharge - discount;

    const updatedBill = await billRepository.updateById(billId, {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      serviceCharge: Math.round(serviceCharge * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    });

    if (!updatedBill) {
      throw new ErrorHandler("Failed to recalculate bill", 500);
    }

    return updatedBill;
  }

  private validatePromoCode(promoCode: string): number {
    const validPromoCodes: { [key: string]: number } = {
      WELCOME10: 10,
      SAVE15: 15,
      VIP20: 20,
      WEEKDAY5: 5,
    };

    const discountRate = validPromoCodes[promoCode.toUpperCase()];

    if (!discountRate) {
      throw new ErrorHandler("Invalid promo code", 400);
    }

    return discountRate;
  }
}

export const billService = new BillService();
