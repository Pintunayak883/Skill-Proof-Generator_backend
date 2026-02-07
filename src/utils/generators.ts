import { v4 as uuidv4 } from "uuid";

export const generateUniqueToken = (): string => {
  return uuidv4();
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
