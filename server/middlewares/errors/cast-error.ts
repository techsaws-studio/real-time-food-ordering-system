import { Request, Response, NextFunction } from "express";

import { ErrorHandler } from "../../utils/error-handler.js";

export const CastError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new ErrorHandler(
    `Resource not found for the provided ID. Invalid ${err.message}.`,
    400
  );

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};
