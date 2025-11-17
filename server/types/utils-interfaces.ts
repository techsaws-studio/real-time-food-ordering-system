import { UserRoleEnum } from "../enums/utils-enums.js";

export interface IJWTPayload {
  sessionId: string;
  tableId: string;
  deviceId?: string;
  role?: UserRoleEnum;
  userId?: string;
  email?: string;
}

export interface IQRCode {
  tableId: string;
  tableNumber: number;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  pagination?: IPaginationMeta;
  timestamp: string;
}

export interface IPaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IPaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface IPaginationQuery {
  page?: string;
  limit?: string;
  pageSize?: string;
}

export interface IDateRange {
  startDate: Date;
  endDate: Date;
}
