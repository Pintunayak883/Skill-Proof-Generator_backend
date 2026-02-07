import { HRUser, IHRUser } from "../models/HRUser";
import { hashPassword, verifyPassword } from "../utils/crypto";
import { generateToken } from "../utils/jwt";
import { createError } from "../utils/errors";

export class AuthService {
  async registerHR(
    name: string,
    email: string,
    password: string,
    company: string,
  ): Promise<{ user: IHRUser; token: string }> {
    // Check if user exists
    const existingUser = await HRUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw createError(409, "Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await HRUser.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      company,
    });

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: "hr",
    });

    return { user, token };
  }

  async loginHR(
    email: string,
    password: string,
  ): Promise<{ user: IHRUser; token: string }> {
    const user = await HRUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw createError(401, "Invalid credentials");
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw createError(401, "Invalid credentials");
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: "hr",
    });

    return { user, token };
  }

  async getHRById(id: string): Promise<IHRUser | null> {
    return HRUser.findById(id);
  }
}

export const authService = new AuthService();
