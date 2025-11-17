import { Request, Response, NextFunction } from "express";

import { ErrorHandler } from "../../utils/error-handler.js";

export const NotFoundError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new ErrorHandler("The requested resource was not found.", 404);

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
  });
};
