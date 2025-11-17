import { Server } from "http";

export const ServerRejectionHandler = (server: Server): void => {
  process.on("unhandledRejection", (reason: any) => {
    console.error(`Unhandled Rejection: ${(reason as Error).message}`);
    console.error(
      "The server will shut down due to an unhandled promise rejection."
    );

    server.close(() => {
      process.exit(1);
    });
  });
};
