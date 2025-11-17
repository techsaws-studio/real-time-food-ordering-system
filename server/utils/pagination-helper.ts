import { Request } from "express";

import { IPaginationParams } from "../types/utils-interfaces.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;
const MIN_LIMIT = 1;

export const parsePaginationParams = (
  req: Request,
  defaultLimit: number = DEFAULT_LIMIT,
  maxLimit: number = MAX_LIMIT
): IPaginationParams => {
  let page = parseInt(req.query.page as string, 10) || DEFAULT_PAGE;
  page = Math.max(1, page);

  let limit =
    parseInt(req.query.limit as string, 10) ||
    parseInt(req.query.pageSize as string, 10) ||
    defaultLimit;

  limit = Math.max(MIN_LIMIT, Math.min(limit, maxLimit));

  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const calculatePaginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
};

export const paginateQuery = <T>(
  query: any,
  page: number,
  limit: number
): any => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

export const paginateArray = <T>(
  array: T[],
  page: number,
  limit: number
): T[] => {
  const skip = (page - 1) * limit;
  return array.slice(skip, skip + limit);
};

export const validatePaginationParams = (
  page: number,
  limit: number,
  maxLimit: number = MAX_LIMIT
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Number.isInteger(page) || page < 1) {
    errors.push("Page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < MIN_LIMIT) {
    errors.push(`Limit must be at least ${MIN_LIMIT}`);
  }

  if (limit > maxLimit) {
    errors.push(`Limit cannot exceed ${maxLimit}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const getPaginationInfo = (
  page: number,
  limit: number,
  total: number
): string => {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return `Showing ${start}-${end} of ${total} items`;
};

export const parseSortParams = (
  req: Request,
  defaultSort: string = "createdAt",
  defaultOrder: "asc" | "desc" = "desc"
): Record<string, 1 | -1> => {
  const sortBy = (req.query.sortBy as string) || defaultSort;
  const order = (req.query.order as string) || defaultOrder;

  const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;

  return { [sortBy]: sortOrder };
};

export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
) => {
  const meta = calculatePaginationMeta(total, page, limit);

  return {
    data,
    pagination: meta,
    info: getPaginationInfo(page, limit, total),
  };
};
