import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config";
import { HRUserPayload } from "../types";

export const generateToken = (payload: HRUserPayload): string => {
  return jwt.sign(payload, config.jwtSecret as Secret, {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): HRUserPayload => {
  return jwt.verify(token, config.jwtSecret as Secret) as HRUserPayload;
};

export const decodeToken = (token: string): HRUserPayload | null => {
  try {
    return jwt.decode(token) as HRUserPayload;
  } catch {
    return null;
  }
};
