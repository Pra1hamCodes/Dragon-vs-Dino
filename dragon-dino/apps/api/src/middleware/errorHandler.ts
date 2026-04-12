import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

const isProduction = process.env["NODE_ENV"] === "production";

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const requestId = req.headers["x-request-id"] as string | undefined;

  logger.error("Unhandled error", {
    error: err.message,
    statusCode,
    code: err.code,
    path: req.path,
    method: req.method,
    requestId,
    stack: isProduction ? undefined : err.stack,
  });

  const response: Record<string, unknown> = {
    error: statusCode >= 500 ? "Internal server error" : err.message,
    code: err.code ?? "UNKNOWN_ERROR",
    requestId,
  };

  if (!isProduction && err.stack) {
    response["stack"] = err.stack;
  }

  res.status(statusCode).json(response);
}
