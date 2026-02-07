export interface HRUserPayload {
  id: string;
  email: string;
  role: "hr";
}

export interface CandidateContext {
  testLinkId: string;
  sessionId: string;
}

export enum SkillLevel {
  BEGINNER = "Beginner",
  INTERMEDIATE = "Intermediate",
  EXPERIENCED = "Experienced",
}

export enum SkillDepth {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export enum LevelSource {
  RESUME = "resume",
  MANUAL = "manual",
}

export enum IntegrityEventType {
  TAB_SWITCH = "TAB_SWITCH",
  WINDOW_BLUR = "WINDOW_BLUR",
  COPY_ATTEMPT = "COPY_ATTEMPT",
  FOCUS_LOSS = "FOCUS_LOSS",
  IDLE_TIMEOUT = "IDLE_TIMEOUT",
}

export enum SessionIntegrityStatus {
  CLEAN = "Clean",
  FLAGGED = "Flagged",
}

export enum ApproachQuality {
  STRUCTURED = "Structured",
  SEMI_STRUCTURED = "Semi-structured",
  RANDOM = "Random",
}

export enum TimeEfficiency {
  FAST = "Fast",
  BALANCED = "Balanced",
  SLOW = "Slow",
}

export enum EvaluationVerdict {
  UNDERSTANDS_WELL = "Understands well",
  SURFACE_LEVEL = "Surface-level",
  NEEDS_IMPROVEMENT = "Needs improvement",
}

export interface ResumeAnalysisOutput {
  detectedSkills: string[];
  skillsDepth: SkillDepth;
  experienceSummary: string;
  projectComplexity: SkillDepth;
  suggestedLevel: SkillLevel;
  confidence: "High" | "Medium" | "Low";
  reasoning: string;
}

export interface EvaluationOutput {
  explanationScore: number;
  approachQuality: ApproachQuality;
  thinkingStyle: string;
  timeEfficiency: TimeEfficiency;
  strengths: string[];
  weaknesses: string[];
  verdict: EvaluationVerdict;
  confidenceInsight: string;
}

export interface BehaviorMetrics {
  totalTimeSeconds: number;
  delayBeforeTypingSeconds: number;
  typingDurationSeconds: number;
  idleTimeSeconds: number;
  answerLength: number;
  tabSwitchCount: number;
  windowBlurCount: number;
  copyAttemptCount: number;
  focusLossCount: number;
}

export interface IntegrityEvent {
  type: IntegrityEventType;
  timestamp: Date;
}
