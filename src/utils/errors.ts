export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational: boolean = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (
  statusCode: number,
  message: string,
  isOperational = true,
): AppError => {
  return new AppError(statusCode, message, isOperational);
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};
