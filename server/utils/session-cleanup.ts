import { tableSessionService } from "../services/table-session-service.js";

export const CleanupExpiredSessions = async (): Promise<void> => {
  try {
    const cleanedCount = await tableSessionService.cleanupExpiredSessions();
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning up sessions: ${(error as Error).message}`);
  }
};

export const StartSessionCleanupJob = (): NodeJS.Timeout => {
  console.log("🕐 Starting session cleanup job (every 15 minutes)");

  CleanupExpiredSessions();

  return setInterval(CleanupExpiredSessions, 15 * 60 * 1000);
};

export const StopSessionCleanupJob = (intervalId: NodeJS.Timeout): void => {
  clearInterval(intervalId);
  console.log("🛑 Stopped session cleanup job");
};
