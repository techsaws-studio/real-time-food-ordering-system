import { Request, Response, NextFunction } from "express";

import { ErrorHandler } from "../../utils/error-handler.js";

export const InternalServerError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new ErrorHandler("An internal server error has occurred.", 500);

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};
