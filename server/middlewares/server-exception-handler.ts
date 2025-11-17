export const ServerExceptionHandler = (): void => {
  process.on("uncaughtException", (err: Error) => {
    console.error(`Uncaught Exception: ${err.message}`);
    console.error("The server will shut down due to an uncaught exception.");
    process.exit(1);
  });
};
