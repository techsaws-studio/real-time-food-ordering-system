import "dotenv/config";

export const AllowedOrigins = (): string[] => {
  const isDev = process.env.NODE_ENV !== "production";
  const frontendURL = process.env.FRONTEND_URL;

  if (isDev) return ["*"];

  if (!frontendURL) {
    throw new Error("FRONTEND_URL is not defined in environment variables");
  }

  return [frontendURL];
};
