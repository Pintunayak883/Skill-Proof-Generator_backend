import { Router } from "express";
import { candidateController } from "../controllers/CandidateController";
import { asyncHandler } from "../middleware/errorHandler";

const router = Router();

// Candidate flow (no auth)
router.post(
  "/:token/personal-info",
  asyncHandler((req, res) => candidateController.submitPersonalInfo(req, res)),
);

// Resume upload now uses UploadThing
// Frontend uploads to UploadThing, then sends the file URL and metadata to this endpoint
router.post(
  "/:token/resume",
  asyncHandler((req, res) => candidateController.uploadResume(req, res)),
);

router.post(
  "/:token/manual-input",
  asyncHandler((req, res) => candidateController.submitManualInput(req, res)),
);
router.post(
  "/:token/task",
  asyncHandler((req, res) => candidateController.generateTask(req, res)),
);

// Generic event logging (non-critical, used by anti-cheat client)
router.post(
  "/:token/event",
  asyncHandler((req, res) => {
    // Fire-and-forget event sink – just acknowledge
    console.log(`[event] ${req.params.token}:`, req.body?.type);
    res.status(200).json({ message: "Event received" });
  }),
);

router.post(
  "/skill-session/:skillSessionId/integrity",
  asyncHandler((req, res) => candidateController.logIntegrityEvent(req, res)),
);
router.post(
  "/skill-session/:skillSessionId/submit",
  asyncHandler((req, res) => candidateController.submitAnswer(req, res)),
);

export default router;
