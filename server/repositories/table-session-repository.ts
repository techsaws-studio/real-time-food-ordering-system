import { ITableSession } from "../types/models-interfaces.js";

import TableSession from "../models/table-session-model.js";

export class TableSessionRepository {
  async findById(sessionId: string): Promise<ITableSession | null> {
    return await TableSession.findOne({ sessionId });
  }

  async findActiveSessionByTableId(
    tableId: string
  ): Promise<ITableSession | null> {
    return await TableSession.findOne({
      tableId: tableId.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
  }

  async findActiveSessionByDeviceId(
    deviceId: string
  ): Promise<ITableSession | null> {
    return await TableSession.findOne({
      deviceId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
  }

  async create(data: {
    tableId: string;
    deviceId: string;
    securityCode: string;
    createdBy: string;
  }): Promise<ITableSession> {
    return await TableSession.create({
      tableId: data.tableId.toUpperCase(),
      deviceId: data.deviceId,
      securityCode: data.securityCode,
      createdBy: data.createdBy,
    });
  }

  async updateSession(
    sessionId: string,
    updates: Partial<ITableSession>
  ): Promise<ITableSession | null> {
    return await TableSession.findOneAndUpdate(
      { sessionId },
      { $set: updates },
      { new: true }
    );
  }

  async incrementVerificationAttempts(
    sessionId: string
  ): Promise<ITableSession | null> {
    return await TableSession.findOneAndUpdate(
      { sessionId },
      { $inc: { verificationAttempts: 1 } },
      { new: true }
    );
  }

  async deactivateSessionsByTableId(tableId: string): Promise<number> {
    const result = await TableSession.updateMany(
      { tableId: tableId.toUpperCase(), isActive: true },
      { $set: { isActive: false, endedAt: new Date() } }
    );
    return result.modifiedCount;
  }

  async cleanupExpiredSessions(): Promise<number> {
    const result = await TableSession.updateMany(
      {
        isActive: true,
        expiresAt: { $lt: new Date() },
      },
      {
        $set: { isActive: false, endedAt: new Date() },
      }
    );
    return result.modifiedCount;
  }

  async getActiveSessionsCount(): Promise<number> {
    return await TableSession.countDocuments({
      isActive: true,
      expiresAt: { $gt: new Date() },
    });
  }

  async getSessionsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ITableSession[]> {
    return await TableSession.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });
  }
}

export const tableSessionRepository = new TableSessionRepository();
