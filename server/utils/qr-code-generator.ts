import "dotenv/config";
import QRCode from "qrcode";

import { IQRCode } from "../types/utils-interfaces.js";

export const GenerateQRCodeDataURL = async (data: IQRCode): Promise<string> => {
  try {
    const qrPayload = JSON.stringify({
      tableId: data.tableId,
      tableNumber: data.tableNumber,
      timestamp: new Date().toISOString(),
    });

    const qrCodeDataURL = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrCodeDataURL;
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${(error as Error).message}`);
  }
};

export const GenerateTableAccessURL = (tableId: string): string => {
  const frontendURL = process.env.FRONTEND_URL || "http://localhost:3000";
  return `${frontendURL}/table/${tableId}`;
};
