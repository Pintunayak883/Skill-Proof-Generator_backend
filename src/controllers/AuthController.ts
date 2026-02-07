import { Request, Response } from "express";
import { authService } from "../services/AuthService";
import { registerHRSchema, loginHRSchema } from "../validators";
import { createError } from "../utils/errors";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const validatedData = registerHRSchema.parse(req.body);
      const { user, token } = await authService.registerHR(
        validatedData.name,
        validatedData.email,
        validatedData.password,
        validatedData.company,
      );

      res.status(201).json({
        message: "HR registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          company: user.company,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("already")) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginHRSchema.parse(req.body);
      const { user, token } = await authService.loginHR(
        validatedData.email,
        validatedData.password,
      );

      res.status(200).json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          company: user.company,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("Invalid")) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      res.status(500).json({ error: "Login failed" });
    }
  }

  async me(req: Request, res: Response) {
    try {
      if (!req.hrUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await authService.getHRById(req.hrUser.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          company: user.company,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  }
}

export const authController = new AuthController();
