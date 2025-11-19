import "dotenv/config";
import { NextFunction, Request, Response } from "express";

import { BillStatusEnum } from "../enums/models-enums.js";

import { billService } from "../services/bill-service.js";
import { tableService } from "../services/table-service.js";

import { billRepository } from "../repositories/bill-repository.js";
import { orderRepository } from "../repositories/order-repository.js";

import { ApiResponse } from "../utils/api-response-formatter.js";
import { CatchAsyncErrors } from "../utils/catch-async-errors.js";
import { ErrorHandler } from "../utils/error-handler.js";

export const CreateOrGetBill = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId, sessionId } = req.body;

    const bill = await billService.createOrGetBill(tableId, sessionId);
    const table = await tableService.getTableById(bill.tableId);

    const orders = await Promise.all(
      bill.orders.map((orderId) => orderRepository.findById(orderId))
    );

    return ApiResponse.success(
      res,
      {
        billId: bill.billId,
        tableId: bill.tableId,
        tableNumber: table.tableNumber,
        sessionId: bill.sessionId,
        orders: orders
          .filter((order) => order !== null)
          .map((order) => ({
            orderId: order!.orderId,
            itemsCount: order!.items.length,
            totalAmount: order!.totalAmount,
            status: order!.status,
          })),
        subtotal: bill.subtotal,
        tax: bill.tax,
        taxRate: bill.taxRate,
        serviceCharge: bill.serviceCharge,
        serviceChargeRate: bill.serviceChargeRate,
        discount: bill.discount,
        discountRate: bill.discountRate,
        promoCode: bill.promoCode,
        total: bill.total,
        status: bill.status,
        createdAt: bill.createdAt,
      },
      bill.createdAt === bill.updatedAt
        ? "Bill created successfully"
        : "Bill retrieved successfully"
    );
  }
);

export const GetBillById = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;

    const bill = await billService.getBillById(billId);
    const table = await tableService.getTableById(bill.tableId);

    const orders = await Promise.all(
      bill.orders.map((orderId) => orderRepository.findById(orderId))
    );

    return ApiResponse.success(
      res,
      {
        billId: bill.billId,
        tableId: bill.tableId,
        tableNumber: table.tableNumber,
        location: table.location,
        sessionId: bill.sessionId,
        orders: orders
          .filter((order) => order !== null)
          .map((order) => ({
            orderId: order!.orderId,
            items: order!.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              subtotal: item.subtotal,
            })),
            totalAmount: order!.totalAmount,
            status: order!.status,
            placedAt: order!.placedAt,
          })),
        subtotal: bill.subtotal,
        tax: bill.tax,
        taxRate: bill.taxRate,
        serviceCharge: bill.serviceCharge,
        serviceChargeRate: bill.serviceChargeRate,
        discount: bill.discount,
        discountRate: bill.discountRate,
        promoCode: bill.promoCode,
        total: bill.total,
        status: bill.status,
        paidAt: bill.paidAt,
        closedAt: bill.closedAt,
        closedBy: bill.closedBy,
        voidedAt: bill.voidedAt,
        voidedBy: bill.voidedBy,
        voidReason: bill.voidReason,
        createdAt: bill.createdAt,
        updatedAt: bill.updatedAt,
      },
      "Bill retrieved successfully"
    );
  }
);

export const GetAllBills = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const bills = await billRepository.findAll();

    return ApiResponse.success(
      res,
      bills.map((bill) => ({
        billId: bill.billId,
        tableId: bill.tableId,
        sessionId: bill.sessionId,
        ordersCount: bill.orders.length,
        subtotal: bill.subtotal,
        total: bill.total,
        status: bill.status,
        createdAt: bill.createdAt,
        paidAt: bill.paidAt,
        closedAt: bill.closedAt,
      })),
      `Retrieved ${bills.length} bill(s) successfully`
    );
  }
);

export const GetCurrentBillBySession = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { sessionId } = req.params;

    const bill = await billService.getCurrentBillBySession(sessionId);
    const table = await tableService.getTableById(bill.tableId);

    return ApiResponse.success(
      res,
      {
        billId: bill.billId,
        tableId: bill.tableId,
        tableNumber: table.tableNumber,
        sessionId: bill.sessionId,
        ordersCount: bill.orders.length,
        subtotal: bill.subtotal,
        tax: bill.tax,
        serviceCharge: bill.serviceCharge,
        discount: bill.discount,
        promoCode: bill.promoCode,
        total: bill.total,
        status: bill.status,
      },
      "Current bill retrieved successfully"
    );
  }
);

export const GetBillsByTable = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { tableId } = req.params;
    const { status } = req.query;

    const table = await tableService.getTableById(tableId);
    let bills = await billService.getBillsByTable(tableId);

    if (status && typeof status === "string") {
      bills = bills.filter((bill) => bill.status === status);
    }

    return ApiResponse.success(
      res,
      {
        tableId: table.tableId,
        tableNumber: table.tableNumber,
        billsCount: bills.length,
        bills: bills.map((bill) => ({
          billId: bill.billId,
          sessionId: bill.sessionId,
          ordersCount: bill.orders.length,
          total: bill.total,
          status: bill.status,
          createdAt: bill.createdAt,
          paidAt: bill.paidAt,
          closedAt: bill.closedAt,
        })),
      },
      `Retrieved ${bills.length} bill(s) for table ${table.tableNumber}`
    );
  }
);

export const GetBillsByStatus = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status } = req.params;

    const bills = await billRepository.findByStatus(status as BillStatusEnum);

    const billsWithTableInfo = await Promise.all(
      bills.map(async (bill) => {
        const table = await tableService.getTableById(bill.tableId);
        return {
          billId: bill.billId,
          tableId: bill.tableId,
          tableNumber: table.tableNumber,
          sessionId: bill.sessionId,
          ordersCount: bill.orders.length,
          total: bill.total,
          status: bill.status,
          createdAt: bill.createdAt,
          paidAt: bill.paidAt,
        };
      })
    );

    return ApiResponse.success(
      res,
      billsWithTableInfo,
      `Retrieved ${bills.length} bill(s) with status '${status}'`
    );
  }
);

export const AddOrderToBill = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;
    const { orderId } = req.body;

    const bill = await billService.addOrderToBill(billId, orderId);

    return ApiResponse.success(
      res,
      {
        billId: bill.billId,
        ordersCount: bill.orders.length,
        subtotal: bill.subtotal,
        tax: bill.tax,
        serviceCharge: bill.serviceCharge,
        discount: bill.discount,
        total: bill.total,
        status: bill.status,
      },
      "Order added to bill successfully"
    );
  }
);

export const ApplyPromoCode = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;
    const { promoCode } = req.body;

    const bill = await billService.applyPromoCode(billId, promoCode);

    return ApiResponse.success(
      res,
      {
        billId: bill.billId,
        promoCode: bill.promoCode,
        discountRate: bill.discountRate,
        discount: bill.discount,
        subtotal: bill.subtotal,
        tax: bill.tax,
        serviceCharge: bill.serviceCharge,
        total: bill.total,
        savings: bill.discount,
      },
      `Promo code '${promoCode}' applied successfully. You saved PKR ${bill.discount}`
    );
  }
);

export const RemovePromoCode = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;

    const bill = await billService.getBillById(billId);

    if (!bill.promoCode) {
      throw new ErrorHandler("No promo code applied to this bill", 400);
    }

    if (bill.status !== BillStatusEnum.OPEN) {
      throw new ErrorHandler(
        `Cannot remove promo code. Current status: ${bill.status}`,
        400
      );
    }

    const oldPromoCode = bill.promoCode;
    const oldDiscount = bill.discount;

    const newTotal = bill.subtotal + bill.tax + bill.serviceCharge;

    const updatedBill = await billRepository.updateById(billId, {
      promoCode: null,
      discount: 0,
      discountRate: 0,
      total: Math.round(newTotal * 100) / 100,
    });

    if (!updatedBill) {
      throw new ErrorHandler("Failed to remove promo code", 500);
    }

    return ApiResponse.success(
      res,
      {
        billId: updatedBill.billId,
        removedPromoCode: oldPromoCode,
        removedDiscount: oldDiscount,
        subtotal: updatedBill.subtotal,
        tax: updatedBill.tax,
        serviceCharge: updatedBill.serviceCharge,
        discount: updatedBill.discount,
        total: updatedBill.total,
      },
      `Promo code '${oldPromoCode}' removed successfully`
    );
  }
);

export const MarkBillPendingPayment = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;

    const bill = await billService.markAsPendingPayment(billId);

    return ApiResponse.success(
      res,
      {
        billId: bill.billId,
        tableId: bill.tableId,
        total: bill.total,
        status: bill.status,
      },
      "Bill marked as pending payment"
    );
  }
);

export const MarkBillPaid = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;

    const bill = await billService.markAsPaid(billId);
    const table = await tableService.getTableById(bill.tableId);

    return ApiResponse.success(
      res,
      {
        billId: bill.billId,
        tableId: bill.tableId,
        tableNumber: table.tableNumber,
        total: bill.total,
        status: bill.status,
        paidAt: bill.paidAt,
      },
      "Bill marked as paid"
    );
  }
);

export const CloseBill = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;
    const closedBy = req.user?.userId;

    if (!closedBy) {
      throw new ErrorHandler("User ID not found in request", 401);
    }

    const bill = await billService.closeBill(billId, closedBy);
    const table = await tableService.getTableById(bill.tableId);

    return ApiResponse.success(
      res,
      {
        billId: bill.billId,
        tableId: bill.tableId,
        tableNumber: table.tableNumber,
        total: bill.total,
        status: bill.status,
        paidAt: bill.paidAt,
        closedAt: bill.closedAt,
        closedBy: bill.closedBy,
        tableStatus: "AVAILABLE",
        sessionEnded: true,
      },
      `Bill closed successfully. Table ${table.tableNumber} is now available.`
    );
  }
);

export const VoidBill = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;
    const { voidReason } = req.body;
    const voidedBy = req.user?.userId;

    if (!voidedBy) {
      throw new ErrorHandler("User ID not found in request", 401);
    }

    const bill = await billService.voidBill(billId, voidedBy, voidReason);

    return ApiResponse.success(
      res,
      {
        billId: bill.billId,
        tableId: bill.tableId,
        total: bill.total,
        status: bill.status,
        voidedAt: bill.voidedAt,
        voidedBy: bill.voidedBy,
        voidReason: bill.voidReason,
      },
      "Bill voided successfully"
    );
  }
);

export const UpdateBillCharges = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;
    const { taxRate, serviceChargeRate, discountRate, manualDiscount } =
      req.body;

    const bill = await billService.getBillById(billId);

    if (bill.status !== BillStatusEnum.OPEN) {
      throw new ErrorHandler(
        `Cannot update charges. Current status: ${bill.status}`,
        400
      );
    }

    const newTaxRate = taxRate !== undefined ? taxRate : bill.taxRate;
    const newServiceChargeRate =
      serviceChargeRate !== undefined
        ? serviceChargeRate
        : bill.serviceChargeRate;
    const newDiscountRate =
      discountRate !== undefined ? discountRate : bill.discountRate;

    const newTax = (bill.subtotal * newTaxRate) / 100;
    const newServiceCharge = (bill.subtotal * newServiceChargeRate) / 100;
    let newDiscount = (bill.subtotal * newDiscountRate) / 100;

    if (manualDiscount !== undefined) {
      newDiscount = manualDiscount;
    }

    const newTotal = bill.subtotal + newTax + newServiceCharge - newDiscount;

    const updatedBill = await billRepository.updateById(billId, {
      taxRate: newTaxRate,
      tax: Math.round(newTax * 100) / 100,
      serviceChargeRate: newServiceChargeRate,
      serviceCharge: Math.round(newServiceCharge * 100) / 100,
      discountRate: manualDiscount !== undefined ? 0 : newDiscountRate,
      discount: Math.round(newDiscount * 100) / 100,
      total: Math.round(newTotal * 100) / 100,
    });

    if (!updatedBill) {
      throw new ErrorHandler("Failed to update bill charges", 500);
    }

    return ApiResponse.success(
      res,
      {
        billId: updatedBill.billId,
        subtotal: updatedBill.subtotal,
        taxRate: updatedBill.taxRate,
        tax: updatedBill.tax,
        serviceChargeRate: updatedBill.serviceChargeRate,
        serviceCharge: updatedBill.serviceCharge,
        discountRate: updatedBill.discountRate,
        discount: updatedBill.discount,
        total: updatedBill.total,
        updatedBy: req.user?.userId,
      },
      "Bill charges updated successfully"
    );
  }
);

export const GetBillStats = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await billService.getBillStats();

    return ApiResponse.success(
      res,
      {
        total: stats.total,
        byStatus: {
          open: stats.open,
          pendingPayment: stats.pendingPayment,
          paid: stats.paid,
          closed: stats.closed,
          void: stats.void,
        },
        revenue: {
          total: stats.totalRevenue,
          averageBillValue: stats.averageBillValue,
        },
        percentages: {
          paidPercentage:
            stats.total > 0
              ? Math.round(((stats.paid + stats.closed) / stats.total) * 100)
              : 0,
          voidPercentage:
            stats.total > 0 ? Math.round((stats.void / stats.total) * 100) : 0,
        },
      },
      "Bill statistics retrieved successfully"
    );
  }
);

export const GetBillsByDateRange = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate, status, minAmount, maxAmount } = req.query;

    if (!startDate || !endDate) {
      throw new ErrorHandler("Start date and end date are required", 400);
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ErrorHandler("Invalid date format", 400);
    }

    let bills = await billRepository.getBillsByDateRange(start, end);

    if (status && typeof status === "string") {
      bills = bills.filter((bill) => bill.status === status);
    }

    if (minAmount) {
      const min = parseFloat(minAmount as string);
      bills = bills.filter((bill) => bill.total >= min);
    }

    if (maxAmount) {
      const max = parseFloat(maxAmount as string);
      bills = bills.filter((bill) => bill.total <= max);
    }

    const totalRevenue = bills
      .filter(
        (bill) =>
          bill.status === BillStatusEnum.PAID ||
          bill.status === BillStatusEnum.CLOSED
      )
      .reduce((sum, bill) => sum + bill.total, 0);

    return ApiResponse.success(
      res,
      {
        count: bills.length,
        dateRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        bills: bills.map((bill) => ({
          billId: bill.billId,
          tableId: bill.tableId,
          sessionId: bill.sessionId,
          ordersCount: bill.orders.length,
          total: bill.total,
          status: bill.status,
          createdAt: bill.createdAt,
          paidAt: bill.paidAt,
          closedAt: bill.closedAt,
        })),
      },
      `Retrieved ${bills.length} bill(s) in date range`
    );
  }
);

export const GetRevenueByDateRange = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ErrorHandler("Start date and end date are required", 400);
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ErrorHandler("Invalid date format", 400);
    }

    const revenue = await billService.getRevenueByDateRange(start, end);

    return ApiResponse.success(
      res,
      {
        dateRange: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        revenue,
      },
      `Revenue for date range: PKR ${revenue}`
    );
  }
);

export const GetAverageBillValue = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const averageValue = await billRepository.getAverageBillValue();

    return ApiResponse.success(
      res,
      {
        averageBillValue: Math.round(averageValue * 100) / 100,
      },
      `Average bill value: PKR ${Math.round(averageValue * 100) / 100}`
    );
  }
);

export const GetCustomerBill = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session) {
      throw new ErrorHandler("Session not found", 401);
    }

    try {
      const bill = await billService.getCurrentBillBySession(
        req.session.sessionId
      );

      const orders = await Promise.all(
        bill.orders.map((orderId) => orderRepository.findById(orderId))
      );

      return ApiResponse.success(
        res,
        {
          billId: bill.billId,
          orders: orders
            .filter((order) => order !== null)
            .map((order) => ({
              orderId: order!.orderId,
              items: order!.items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal,
              })),
              totalAmount: order!.totalAmount,
            })),
          subtotal: bill.subtotal,
          tax: bill.tax,
          taxRate: bill.taxRate,
          serviceCharge: bill.serviceCharge,
          serviceChargeRate: bill.serviceChargeRate,
          discount: bill.discount,
          promoCode: bill.promoCode,
          total: bill.total,
          status: bill.status,
        },
        "Bill retrieved successfully"
      );
    } catch (error) {
      return ApiResponse.success(
        res,
        {
          billId: null,
          message: "No bill created yet. Place an order to generate a bill.",
        },
        "No current bill"
      );
    }
  }
);

export const RequestBill = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.session) {
      throw new ErrorHandler("Session not found", 401);
    }

    const bill = await billService.createOrGetBill(
      req.session.tableId,
      req.session.sessionId
    );

    const updatedBill = await billService.markAsPendingPayment(bill.billId);

    const table = await tableService.getTableById(bill.tableId);

    return ApiResponse.success(
      res,
      {
        billId: updatedBill.billId,
        tableId: updatedBill.tableId,
        tableNumber: table.tableNumber,
        total: updatedBill.total,
        status: updatedBill.status,
        message: "Staff has been notified. Please wait for payment processing.",
      },
      "Bill requested successfully"
    );
  }
);

export const GetOpenBills = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const openBills = await billRepository.findByStatus(BillStatusEnum.OPEN);
    const pendingBills = await billRepository.findByStatus(
      BillStatusEnum.PENDING_PAYMENT
    );

    const allBills = [...openBills, ...pendingBills];

    const billsWithTableInfo = await Promise.all(
      allBills.map(async (bill) => {
        const table = await tableService.getTableById(bill.tableId);
        return {
          billId: bill.billId,
          tableId: bill.tableId,
          tableNumber: table.tableNumber,
          location: table.location,
          sessionId: bill.sessionId,
          ordersCount: bill.orders.length,
          total: bill.total,
          status: bill.status,
          createdAt: bill.createdAt,
        };
      })
    );

    billsWithTableInfo.sort((a, b) => {
      if (
        a.status === BillStatusEnum.PENDING_PAYMENT &&
        b.status !== BillStatusEnum.PENDING_PAYMENT
      ) {
        return -1;
      }
      if (
        b.status === BillStatusEnum.PENDING_PAYMENT &&
        a.status !== BillStatusEnum.PENDING_PAYMENT
      ) {
        return 1;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return ApiResponse.success(
      res,
      {
        count: billsWithTableInfo.length,
        openCount: openBills.length,
        pendingPaymentCount: pendingBills.length,
        bills: billsWithTableInfo,
      },
      `Retrieved ${billsWithTableInfo.length} open/pending bill(s)`
    );
  }
);

export const RecalculateBill = CatchAsyncErrors(
  async (req: Request, res: Response, next: NextFunction) => {
    const { billId } = req.params;

    const bill = await billService.getBillById(billId);

    if (bill.status !== BillStatusEnum.OPEN) {
      throw new ErrorHandler(
        `Cannot recalculate bill. Current status: ${bill.status}`,
        400
      );
    }

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

    return ApiResponse.success(
      res,
      {
        billId: updatedBill.billId,
        subtotal: updatedBill.subtotal,
        tax: updatedBill.tax,
        serviceCharge: updatedBill.serviceCharge,
        discount: updatedBill.discount,
        total: updatedBill.total,
        recalculatedBy: req.user?.userId,
      },
      "Bill recalculated successfully"
    );
  }
);
