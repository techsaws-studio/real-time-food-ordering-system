import { ITableSession } from "../types/models-interfaces.js";

import { tableSessionRepository } from "../repositories/table-session-repository.js";

import { GenerateSecurityCode } from "../utils/security-code-generator.js";
import { ErrorHandler } from "../utils/error-handler.js";

export class TableSessionService {
  async createSession(
    tableId: string,
    deviceId: string,
    createdBy: string
  ): Promise<{ session: ITableSession; securityCode: string }> {
    // Check if device already has an active session
    const existingDeviceSession =
      await tableSessionRepository.findActiveSessionByDeviceId(deviceId);

    if (existingDeviceSession) {
      throw new ErrorHandler(
        "This device already has an active session. Please end the current session first.",
        400
      );
    }

    // Deactivate any existing sessions for this table
    await tableSessionRepository.deactivateSessionsByTableId(tableId);

    // Generate security code
    const securityCode = GenerateSecurityCode();

    // Create new session
    const session = await tableSessionRepository.create({
      tableId,
      deviceId,
      securityCode,
      createdBy,
    });

    return { session, securityCode };
  }

  async verifySession(
    sessionId: string,
    securityCode: string
  ): Promise<ITableSession> {
    const session = await tableSessionRepository.findById(sessionId);

    if (!session) {
      throw new ErrorHandler("Session not found", 404);
    }

    if (!session.isActive) {
      throw new ErrorHandler("Session is no longer active", 400);
    }

    if (this.isSessionExpired(session)) {
      await this.endSession(sessionId);
      throw new ErrorHandler("Session has expired", 401);
    }

    if (session.isVerified) {
      throw new ErrorHandler("Session is already verified", 400);
    }

    if (!this.canAttemptVerification(session)) {
      await tableSessionRepository.updateSession(sessionId, {
        isActive: false,
        endedAt: new Date(),
      });
      throw new ErrorHandler(
        "Maximum verification attempts exceeded. Session has been terminated.",
        403
      );
    }

    // Increment attempts
    await tableSessionRepository.incrementVerificationAttempts(sessionId);

    // Verify code
    if (session.securityCode !== securityCode) {
      const remainingAttempts =
        session.maxVerificationAttempts - (session.verificationAttempts + 1);
      throw new ErrorHandler(
        `Invalid security code. ${remainingAttempts} attempt(s) remaining.`,
        401
      );
    }

    // Mark as verified
    const verifiedSession = await tableSessionRepository.updateSession(
      sessionId,
      {
        isVerified: true,
        verifiedAt: new Date(),
      }
    );

    if (!verifiedSession) {
      throw new ErrorHandler("Failed to verify session", 500);
    }

    return verifiedSession;
  }

  async endSession(sessionId: string): Promise<ITableSession> {
    const session = await tableSessionRepository.findById(sessionId);

    if (!session) {
      throw new ErrorHandler("Session not found", 404);
    }

    if (!session.isActive) {
      throw new ErrorHandler("Session is already ended", 400);
    }

    const endedSession = await tableSessionRepository.updateSession(sessionId, {
      isActive: false,
      endedAt: new Date(),
    });

    if (!endedSession) {
      throw new ErrorHandler("Failed to end session", 500);
    }

    return endedSession;
  }

  async getSessionById(sessionId: string): Promise<ITableSession> {
    const session = await tableSessionRepository.findById(sessionId);

    if (!session) {
      throw new ErrorHandler("Session not found", 404);
    }

    return session;
  }

  async validateActiveSession(sessionId: string): Promise<ITableSession> {
    const session = await this.getSessionById(sessionId);

    if (!session.isActive) {
      throw new ErrorHandler("Session is not active", 401);
    }

    if (!session.isVerified) {
      throw new ErrorHandler("Session is not verified", 401);
    }

    if (this.isSessionExpired(session)) {
      await this.endSession(sessionId);
      throw new ErrorHandler("Session has expired", 401);
    }

    return session;
  }

  isSessionExpired(session: ITableSession): boolean {
    return new Date() > session.expiresAt;
  }

  isSessionValid(session: ITableSession): boolean {
    return (
      session.isActive && !this.isSessionExpired(session) && session.isVerified
    );
  }

  canAttemptVerification(session: ITableSession): boolean {
    return session.verificationAttempts < session.maxVerificationAttempts;
  }

  async cleanupExpiredSessions(): Promise<number> {
    return await tableSessionRepository.cleanupExpiredSessions();
  }

  async getActiveSessionsCount(): Promise<number> {
    return await tableSessionRepository.getActiveSessionsCount();
  }

  async getSessionsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<ITableSession[]> {
    return await tableSessionRepository.getSessionsByDateRange(
      startDate,
      endDate
    );
  }
}

export const tableSessionService = new TableSessionService();
