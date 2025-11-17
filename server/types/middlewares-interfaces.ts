export interface IRetryOptions {
  maxRetries: number;
  retryDelay: number;
}

export interface ICustomError extends Error {
  statusCode?: number;
  code?: number;
}
