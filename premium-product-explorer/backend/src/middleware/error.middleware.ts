import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError";
import { logger } from "../config/logger";

export function notFoundHandler(_req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    return void res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details
    });
  }

  if (err instanceof ZodError) {
    return void res.status(400).json({
      success: false,
      message: "Validation failed",
      details: err.flatten()
    });
  }

  if (err instanceof Error && "code" in err && (err as { code?: string }).code === "P2002") {
    return void res.status(409).json({
      success: false,
      message: "Resource already exists"
    });
  }

  logger.error(err);
  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
}
