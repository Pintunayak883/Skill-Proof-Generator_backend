import { Request, Response } from "express";
import { testLinkService } from "../services/TestLinkService";
import { candidateService } from "../services/CandidateService";
import { resumeService } from "../services/ResumeService";
import { skillSessionService } from "../services/SkillSessionService";
import { integrityService } from "../services/IntegrityService";
import { evaluationService } from "../services/EvaluationService";
import { jobPositionService } from "../services/JobPositionService";
import { geminiAIService } from "../ai/geminiService";
import {
  candidatePersonalInfoSchema,
  manualSkillInputSchema,
  answerSubmissionSchema,
  integrityEventSchema,
  sessionIdSchema,
} from "../validators";
import { SkillLevel } from "../types";
import { extractTextFromUrl, getFileTypeFromMime } from "../utils/fileParser";

export class CandidateController {
  // Step 1: Personal details
  async submitPersonalInfo(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const testLink = await testLinkService.validateTestLink(token);

      const personalInfo = candidatePersonalInfoSchema.parse(req.body);

      // Create candidate with placeholder level info (will be updated after resume/manual input)
      const candidate = await candidateService.createCandidate(
        testLink._id,
        personalInfo.name,
        personalInfo.email,
        personalInfo.phone,
        "manual",
        "Beginner",
        "Low",
      );

      res.status(201).json({
        message: "Candidate details saved",
        candidate: {
          id: candidate._id,
          sessionId: candidate.sessionId,
        },
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Candidate already")
      ) {
        return res.status(409).json({ error: error.message });
      }
      console.error("[submitPersonalInfo]", error);
      res.status(500).json({ error: "Failed to submit personal info" });
    }
  }

  // Step 2A: Resume upload and analysis (UploadThing)
  async uploadResume(req: Request, res: Response) {
    try {
      const { token } = req.params;
      console.log(
        "[uploadResume] Request body:",
        JSON.stringify(req.body, null, 2),
      );
      console.log("[uploadResume] Token:", token);

      const testLink = await testLinkService.validateTestLink(token);

      // Expect: { sessionId, resumeUrl, fileKey, fileName, fileMimeType }
      const { sessionId, resumeUrl, fileKey, fileName, fileMimeType } =
        req.body;

      if (!sessionId || !resumeUrl || !fileKey) {
        console.error("[uploadResume] Missing fields:", {
          sessionId: !!sessionId,
          resumeUrl: !!resumeUrl,
          fileKey: !!fileKey,
        });
        return res.status(400).json({
          error: "Missing required fields: sessionId, resumeUrl, fileKey",
          received: {
            sessionId: !!sessionId,
            resumeUrl: !!resumeUrl,
            fileKey: !!fileKey,
          },
        });
      }

      const candidate =
        await candidateService.getCandidateBySessionId(sessionId);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      const jobPosition = await jobPositionService.getJobPositionById(
        testLink.jobPositionId.toString(),
      );
      if (!jobPosition) {
        return res.status(404).json({ error: "Job position not found" });
      }

      // Determine file type from MIME type (provided by frontend)
      const fileType = fileMimeType ? getFileTypeFromMime(fileMimeType) : "pdf";

      // Download and extract text from UploadThing URL
      const rawText = await extractTextFromUrl(resumeUrl, fileType);

      // Store resume with UploadThing URL
      const resume = await resumeService.storeResume(
        candidate._id,
        fileName || "resume.pdf",
        fileType,
        resumeUrl,
        fileKey,
        rawText,
      );

      // Analyze with Gemini
      const analysis = await geminiAIService.analyzeResume(
        rawText,
        jobPosition.requiredSkills,
      );

      // Store analysis
      await resumeService.storeResumeAnalysis(
        resume._id,
        candidate._id,
        analysis,
      );

      // Update candidate with inferred level
      await candidateService.updateCandidate(candidate._id.toString(), {
        levelSource: "resume",
        inferredLevel: analysis.suggestedLevel,
        inferredLevelConfidence: analysis.confidence,
      });

      res.status(200).json({
        message: "Resume analyzed",
        analysis,
      });
    } catch (error) {
      console.error(
        "[uploadResume] Error:",
        error instanceof Error ? error.message : String(error),
      );
      if (
        error instanceof Error &&
        error.message.includes("Unsupported file type")
      ) {
        return res.status(400).json({ error: error.message });
      }
      res
        .status(500)
        .json({
          error: "Resume upload failed",
          details: error instanceof Error ? error.message : undefined,
        });
    }
  }

  // Step 2B: Manual input
  async submitManualInput(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const testLink = await testLinkService.validateTestLink(token);

      const { sessionId } = sessionIdSchema.parse(req.body);
      const candidate =
        await candidateService.getCandidateBySessionId(sessionId);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      const manualInput = manualSkillInputSchema.parse(req.body);

      const jobPosition = await jobPositionService.getJobPositionById(
        testLink.jobPositionId.toString(),
      );
      if (!jobPosition) {
        return res.status(404).json({ error: "Job position not found" });
      }

      // Combine manual input for analysis
      const combinedText = `Skills: ${manualInput.skills.join(", ")}\nExperience: ${manualInput.experienceDescription}\nProjects: ${manualInput.projectsDescription}`;

      // Analyze with Gemini
      const analysis = await geminiAIService.analyzeResume(
        combinedText,
        jobPosition.requiredSkills,
      );

      // Update candidate with inferred level
      await candidateService.updateCandidate(candidate._id.toString(), {
        levelSource: "manual",
        inferredLevel: analysis.suggestedLevel,
        inferredLevelConfidence: analysis.confidence,
      });

      res.status(200).json({
        message: "Manual input analyzed",
        analysis,
      });
    } catch (error) {
      console.error("[submitManualInput]", error);
      res.status(500).json({ error: "Manual input failed" });
    }
  }

  // Step 3: Generate task
  async generateTask(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const testLink = await testLinkService.validateTestLink(token);

      const { sessionId } = sessionIdSchema.parse(req.body);
      const candidate =
        await candidateService.getCandidateBySessionId(sessionId);
      if (!candidate) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      // Check if session already exists (prevent multiple attempts)
      const existingSession =
        await skillSessionService.getSkillSessionByCandidateAndTestLink(
          candidate._id,
          testLink._id,
        );
      if (existingSession) {
        if (
          existingSession.isSubmitted ||
          existingSession.testAttemptCount >= 1
        ) {
          return res.status(403).json({ error: "Test attempt already used" });
        }

        return res.status(200).json({
          message: "Task already generated",
          task: {
            taskName: existingSession.taskGiven,
            taskDescription: existingSession.taskDescription,
          },
          skillSessionId: existingSession._id,
        });
      }

      const jobPosition = await jobPositionService.getJobPositionById(
        testLink.jobPositionId.toString(),
      );
      if (!jobPosition) {
        return res.status(404).json({ error: "Job position not found" });
      }

      const task = await geminiAIService.generateTask(
        jobPosition.title,
        jobPosition.requiredSkills,
        candidate.inferredLevel as SkillLevel,
        jobPosition.description,
      );

      // Create skill session
      // Create skill session with race condition handling
      let skillSession;
      try {
        skillSession = await skillSessionService.createSkillSession(
          testLink._id,
          candidate._id,
          candidate.sessionId,
          task.taskName,
          task.taskDescription,
          candidate.inferredLevel,
        );
      } catch (err: any) {
        if (err.code === 11000) {
          // Session already exists (likely race condition), fetch it
          const existing = await skillSessionService.getSkillSessionBySessionId(
            candidate.sessionId,
          );
          if (!existing) throw err;
          skillSession = existing;
        } else {
          throw err;
        }
      }

      // Create integrity log (ignore if already exists)
      try {
        await integrityService.createIntegrityLog(
          skillSession._id,
          candidate._id,
          testLink._id,
        );
      } catch (e) {
        // Ignore unique constraint violation on integrity logs if any
      }

      res.status(200).json({
        message: "Task generated",
        task: {
          taskName: skillSession.taskGiven,
          taskDescription: skillSession.taskDescription,
        },
        skillSessionId: skillSession._id,
      });
    } catch (error) {
      console.error("[generateTask]", error);
      res.status(500).json({ error: "Failed to generate task" });
    }
  }

  // Step 4: Log integrity events
  async logIntegrityEvent(req: Request, res: Response) {
    try {
      const { skillSessionId } = req.params;
      const event = integrityEventSchema.parse(req.body);

      await integrityService.recordIntegrityEvent(
        skillSessionId,
        event.type,
        event.timestamp,
      );

      res.status(200).json({ message: "Integrity event logged" });
    } catch (error) {
      res.status(500).json({ error: "Failed to log integrity event" });
    }
  }

  // Step 5: Submit answer and evaluate
  async submitAnswer(req: Request, res: Response) {
    try {
      const { skillSessionId } = req.params;
      const submission = answerSubmissionSchema.parse(req.body);

      const skillSession =
        await skillSessionService.getSkillSessionById(skillSessionId);
      if (!skillSession) {
        return res.status(404).json({ error: "Skill session not found" });
      }

      if (skillSession.isSubmitted) {
        return res.status(409).json({ error: "Answer already submitted" });
      }

      // Update attempt count
      await skillSessionService.updateAttemptCount(skillSessionId);

      // Save answer
      await skillSessionService.submitAnswer(
        skillSessionId,
        submission.explanation,
        submission.pseudoCode,
        submission.snapshots,
      );

      // Load related data for evaluation
      const candidate = await candidateService.getCandidateById(
        skillSession.candidateId.toString(),
      );
      const testLink = await testLinkService.getTestLinkById(
        skillSession.testLinkId.toString(),
      );
      const jobPosition = testLink
        ? await jobPositionService.getJobPositionById(
            testLink.jobPositionId.toString(),
          )
        : null;

      if (!candidate || !testLink || !jobPosition) {
        return res
          .status(500)
          .json({ error: "Failed to resolve evaluation context" });
      }

      const resumeAnalysis = await resumeService.getResumeAnalysisByCandidateId(
        candidate._id,
      );

      const evaluation = await geminiAIService.evaluateAnswer(
        `${skillSession.taskGiven}\n${skillSession.taskDescription}`,
        submission.explanation,
        submission.behaviorMetrics,
        jobPosition.requiredSkills,
        candidate.inferredLevel as SkillLevel,
      );

      const confidenceInsight =
        await evaluationService.generateConfidenceInsight(
          evaluation.explanationScore,
          resumeAnalysis?.analysis.suggestedLevel,
          resumeAnalysis?.analysis.confidence,
        );

      await evaluationService.storeEvaluationResult(
        skillSession._id,
        candidate._id,
        testLink._id,
        evaluation,
        submission.behaviorMetrics,
        resumeAnalysis?.analysis.suggestedLevel,
        resumeAnalysis?.analysis.confidence,
        confidenceInsight,
      );

      const integrityStatus = await integrityService.finalizeIntegrityStatus(
        skillSession._id,
      );

      const answerSummary =
        submission.explanation.length > 400
          ? `${submission.explanation.substring(0, 400)}...`
          : submission.explanation;

      const thinkingInsight = `Approach: ${evaluation.approachQuality}. Thinking style: ${evaluation.thinkingStyle}.`;
      const timeAndBehaviorInsight = `Time efficiency: ${evaluation.timeEfficiency}. Total time ${submission.behaviorMetrics.totalTimeSeconds}s. Tab switches: ${submission.behaviorMetrics.tabSwitchCount}.`;

      const reportText = await geminiAIService.generateSkillProofReportText(
        candidate.name,
        jobPosition.title,
        candidate.inferredLevel as SkillLevel,
        `${skillSession.taskGiven}: ${skillSession.taskDescription}`,
        answerSummary,
        evaluation,
        submission.behaviorMetrics,
        integrityStatus,
        confidenceInsight,
      );

      await evaluationService.generateSkillProofReport(
        candidate._id,
        skillSession._id,
        testLink._id,
        jobPosition._id,
        candidate.name,
        candidate.email,
        jobPosition.title,
        candidate.inferredLevel,
        `${skillSession.taskGiven}: ${skillSession.taskDescription}`,
        answerSummary,
        reportText,
        evaluation.strengths,
        evaluation.weaknesses,
        thinkingInsight,
        timeAndBehaviorInsight,
        integrityStatus,
        confidenceInsight,
        submission.snapshots,
      );

      res.status(200).json({
        message: "Answer submitted and evaluated",
        evaluation,
        integrityStatus,
        confidenceInsight,
      });
    } catch (error) {
      console.error("[submitAnswer]", error);
      res.status(500).json({ error: "Failed to submit answer" });
    }
  }
}

export const candidateController = new CandidateController();
