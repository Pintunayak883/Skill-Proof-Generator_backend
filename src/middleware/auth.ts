import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { HRUserPayload } from "../types";
import { createError } from "../utils/errors";

declare global {
  namespace Express {
    interface Request {
      hrUser?: HRUserPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw createError(401, "No token provided");
    }

    const decoded = verifyToken(token);
    req.hrUser = decoded;
    next();
  } catch (error) {
    if (error instanceof Error && error.message.includes("expired")) {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(401).json({ error: "Unauthorized" });
  }
};
