import { UserRoleEnum } from "../enums/utils-enums.js";

export interface IJWTPayload {
  sessionId: string;
  tableId: string;
  deviceId?: string;
  role?: UserRoleEnum;
}

export interface IQRCode {
  tableId: string;
  tableNumber: number;
}
