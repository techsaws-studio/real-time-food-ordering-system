import { Request, Response, NextFunction } from "express";

import { ErrorHandler } from "../../utils/error-handler.js";

export const DuplicateKeyError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new ErrorHandler(
    `A duplicate key error occurred: ${
      Object.keys(err.keyValue)[0]
    } already exists.`,
    400
  );

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};
