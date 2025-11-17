const SocketErrorHandler = (socket: any) => {
  socket.on("error", (error: string) => {
    console.error(`Error from socket ${socket.id}: ${error}`);
    socket.emit("errorOccurred", { message: error });
  });
};

export { SocketErrorHandler };
