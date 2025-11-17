import { Response } from "express";

import { IApiResponse, IPaginationMeta } from "../types/utils-interfaces.js";

export class ApiResponse {
  static success<T>(
    res: Response,
    data: T,
    message: string = "Operation successful",
    statusCode: number = 200
  ): Response {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    data: T,
    message: string = "Resource created successfully"
  ): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = "Data retrieved successfully"
  ): Response {
    const totalPages = Math.ceil(total / limit);

    const pagination: IPaginationMeta = {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    const response: IApiResponse<T[]> = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any
  ): Response {
    const response: IApiResponse = {
      success: false,
      error: {
        message,
        code,
        details,
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(statusCode).json(response);
  }

  static badRequest(
    res: Response,
    message: string = "Bad request",
    details?: any
  ): Response {
    return ApiResponse.error(res, message, 400, "BAD_REQUEST", details);
  }

  static unauthorized(
    res: Response,
    message: string = "Unauthorized access"
  ): Response {
    return ApiResponse.error(res, message, 401, "UNAUTHORIZED");
  }

  static forbidden(
    res: Response,
    message: string = "Access forbidden"
  ): Response {
    return ApiResponse.error(res, message, 403, "FORBIDDEN");
  }

  static notFound(
    res: Response,
    message: string = "Resource not found"
  ): Response {
    return ApiResponse.error(res, message, 404, "NOT_FOUND");
  }

  static internalError(
    res: Response,
    message: string = "Internal server error",
    details?: any
  ): Response {
    return ApiResponse.error(res, message, 500, "INTERNAL_ERROR", details);
  }

  static validationError(
    res: Response,
    errors: any[],
    message: string = "Validation failed"
  ): Response {
    return ApiResponse.error(res, message, 422, "VALIDATION_ERROR", errors);
  }

  static conflict(
    res: Response,
    message: string = "Resource conflict"
  ): Response {
    return ApiResponse.error(res, message, 409, "CONFLICT");
  }

  static tooManyRequests(
    res: Response,
    message: string = "Too many requests",
    retryAfter?: number
  ): Response {
    if (retryAfter) {
      res.setHeader("Retry-After", retryAfter.toString());
    }
    return ApiResponse.error(res, message, 429, "TOO_MANY_REQUESTS");
  }
}

export type { IApiResponse, IPaginationMeta };
