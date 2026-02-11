import { z } from "zod";
import {
  SkillDepth,
  SkillLevel,
  ApproachQuality,
  TimeEfficiency,
  EvaluationVerdict,
  IntegrityEventType,
} from "../types";

// HR Auth Validators
export const registerHRSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  company: z.string().min(2).max(100),
});

export const loginHRSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Job Position Validators
export const createJobPositionSchema = z.object({
  title: z.string().min(3).max(100),
  requiredSkills: z.array(z.string().min(1)).min(1),
  experienceLevel: z.enum(["Beginner", "Intermediate", "Experienced"]),
  description: z.string().min(10).max(2000).optional(),
});

// Test Link Validators
export const generateTestLinkSchema = z.object({
  jobPositionId: z.string(),
  expiryDays: z.number().min(1).max(365).optional(),
});

// Candidate Personal Info Validators
export const candidatePersonalInfoSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z
    .string()
    .regex(/^[+\d\s\-()]+$/)
    .min(10)
    .max(20),
});

// Manual Skill Input Validators
export const manualSkillInputSchema = z.object({
  skills: z.array(z.string().min(1)).min(1),
  experienceDescription: z.string().min(20).max(2000),
  projectsDescription: z.string().min(20).max(2000),
});

// Answer Submission Validators
export const answerSubmissionSchema = z.object({
  explanation: z.string().min(10).max(5000),
  pseudoCode: z.string().max(2000).optional(),
  behaviorMetrics: z.object({
    totalTimeSeconds: z.number().min(0),
    delayBeforeTypingSeconds: z.number().min(0),
    typingDurationSeconds: z.number().min(0),
    idleTimeSeconds: z.number().min(0),
    answerLength: z.number().min(0),
    tabSwitchCount: z.number().min(0),
    windowBlurCount: z.number().min(0),
    copyAttemptCount: z.number().min(0),
    focusLossCount: z.number().min(0),
  }),
  snapshots: z.array(z.string()).optional(),
});

export const sessionIdSchema = z.object({
  sessionId: z.string().min(6).max(100),
});

// Integrity Event Validators
export const integrityEventSchema = z.object({
  type: z.nativeEnum(IntegrityEventType),
  timestamp: z.coerce.date(),
});

// Gemini Resume Analysis Output Validator
export const resumeAnalysisOutputSchema = z.object({
  detectedSkills: z.array(z.string()),
  skillsDepth: z.nativeEnum(SkillDepth),
  experienceSummary: z.string(),
  projectComplexity: z.nativeEnum(SkillDepth),
  suggestedLevel: z.nativeEnum(SkillLevel),
  confidence: z.enum(["High", "Medium", "Low"]),
  reasoning: z.string(),
});

// Gemini Evaluation Output Validator
export const evaluationOutputSchema = z.object({
  explanationScore: z.number().min(0).max(10),
  approachQuality: z.nativeEnum(ApproachQuality),
  thinkingStyle: z.string(),
  timeEfficiency: z.nativeEnum(TimeEfficiency),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  verdict: z.nativeEnum(EvaluationVerdict),
  confidenceInsight: z.string(),
});

// Dashboard Filter Validators
export const dashboardFilterSchema = z.object({
  skillLevel: z.enum(["Beginner", "Intermediate", "Experienced"]).optional(),
  verdict: z
    .enum(["Understands well", "Surface-level", "Needs improvement"])
    .optional(),
  integrityStatus: z.enum(["Clean", "Flagged"]).optional(),
  confidenceInsight: z
    .enum(["Overconfidence", "Underconfidence", "Accurate confidence"])
    .optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});
