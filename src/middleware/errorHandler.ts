import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, isAppError } from "../utils/errors";

export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", error);

  if (isAppError(error)) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.statusCode,
    });
  }

  // Handle validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      code: 400,
      details: error.errors,
    });
  }

  // Generic error
  res.status(500).json({
    error: "Internal server error",
    code: 500,
  });
};

export const asyncHandler =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction,
    ) => Promise<unknown> | unknown,
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
