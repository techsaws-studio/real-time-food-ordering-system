import { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue, ZodSchema } from "zod";

import { ErrorHandler } from "../utils/error-handler.js";

export const ValidateRequest = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((err: ZodIssue) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });

        next(
          new ErrorHandler(`Validation Failed: ${messages.join(", ")}`, 400)
        );
      } else {
        next(error);
      }
    }
  };
};
