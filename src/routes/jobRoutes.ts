import { Router } from "express";
import { jobPositionController } from "../controllers/JobPositionController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

router.post(
  "/positions",
  authMiddleware,
  asyncHandler((req, res) => jobPositionController.createJobPosition(req, res)),
);
router.get(
  "/positions",
  authMiddleware,
  asyncHandler((req, res) => jobPositionController.getJobPositions(req, res)),
);
router.get(
  "/positions/:id",
  authMiddleware,
  asyncHandler((req, res) =>
    jobPositionController.getJobPositionById(req, res),
  ),
);

router.post(
  "/test-links",
  authMiddleware,
  asyncHandler((req, res) => jobPositionController.generateTestLink(req, res)),
);
router.get(
  "/test-links",
  authMiddleware,
  asyncHandler((req, res) => jobPositionController.getTestLinks(req, res)),
);
router.patch(
  "/test-links/:linkId/revoke",
  authMiddleware,
  asyncHandler((req, res) => jobPositionController.revokeTestLink(req, res)),
);

export default router;
