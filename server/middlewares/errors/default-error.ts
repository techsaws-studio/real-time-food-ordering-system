import { Request, Response, NextFunction } from "express";

import { ErrorHandler } from "../../utils/error-handler.js";

export const DefaultError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = err.message || "An unknown error has occurred.";

  const error = new ErrorHandler(message, 500);

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};
