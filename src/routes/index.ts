import { Router } from "express";
import authRoutes from "./authRoutes";
import jobRoutes from "./jobRoutes";
import candidateRoutes from "./candidateRoutes";
import dashboardRoutes from "./dashboardRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/hr", jobRoutes);
router.use("/candidate", candidateRoutes);
router.use("/hr/dashboard", dashboardRoutes);

export default router;
