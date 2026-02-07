import { Router } from "express";
import { authController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post(
  "/register",
  asyncHandler((req, res) => authController.register(req, res)),
);
router.post(
  "/login",
  asyncHandler((req, res) => authController.login(req, res)),
);
router.get(
  "/me",
  authMiddleware,
  asyncHandler((req, res) => authController.me(req, res)),
);

export default router;
