import { Router } from "express";
import { dashboardController } from "../controllers/DashboardController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.get(
  "/reports",
  authMiddleware,
  asyncHandler((req, res) => dashboardController.getReports(req, res)),
);
router.get(
  "/reports/:id",
  authMiddleware,
  asyncHandler((req, res) => dashboardController.getReportDetail(req, res)),
);
router.get(
  "/submissions",
  authMiddleware,
  asyncHandler((req, res) => dashboardController.getSubmissions(req, res)),
);

export default router;
