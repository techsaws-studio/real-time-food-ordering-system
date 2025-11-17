import { Request, Response, NextFunction } from "express";

import { ErrorHandler } from "../../utils/error-handler.js";

export const BadRequestError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new ErrorHandler(`Bad Request: ${err.message}`, 400);

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};
