import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";
import {
  ResumeAnalysisOutput,
  EvaluationOutput,
  BehaviorMetrics,
  SkillLevel,
  SkillDepth,
  ApproachQuality,
  TimeEfficiency,
  EvaluationVerdict,
} from "../types";
import {
  resumeAnalysisOutputSchema,
  evaluationOutputSchema,
} from "../validators";
import { createError } from "../utils/errors";

class GeminiAIService {
  private client?: GoogleGenerativeAI;
  private model?: any;
  private fallbackModel?: any;

  constructor() {
    if (config.geminiApiKey) {
      this.client = new GoogleGenerativeAI(config.geminiApiKey);
      this.model = this.client.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
      this.fallbackModel = this.client.getGenerativeModel({
        model: "gemini-1.5-flash",
      });
    }
  }

  private ensureReady() {
    if (!this.model) {
      throw createError(500, "GEMINI_API_KEY is not configured");
    }
  }

  private async callWithRetry(prompt: string, retries = 2): Promise<string> {
    this.ensureReady();
    const models = [this.model, this.fallbackModel].filter(Boolean);
    let lastError: any;

    for (const m of models) {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await m.generateContent(prompt);
          return response.response.text();
        } catch (err: any) {
          lastError = err;
          const msg = err?.message || "";
          console.warn(
            `[GeminiAI] attempt ${attempt + 1} failed (${m?.model || "unknown"}): ${msg.substring(0, 120)}`,
          );
          // If rate-limited, wait before retrying
          if (msg.includes("429")) {
            await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
            continue;
          }
          // If model not found, skip to fallback
          if (msg.includes("404")) {
            break;
          }
          // Other errors, retry once
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      }
    }
    throw lastError || createError(500, "All Gemini API attempts failed");
  }

  async analyzeResume(
    resumeText: string,
    requiredSkills: string[],
  ): Promise<ResumeAnalysisOutput> {
    this.ensureReady();
    const prompt = `
You are an expert resume analyzer for hiring platforms. Analyze the following resume text and extract key information about the candidate's skills and experience level.

REQUIRED SKILLS TO MATCH: ${requiredSkills.join(", ")}

RESUME TEXT:
${resumeText}

Please provide a JSON response with EXACTLY this structure (no markdown, just pure JSON):
{
  "detectedSkills": ["skill1", "skill2", ...],
  "skillsDepth": "Low|Medium|High",
  "experienceSummary": "Brief summary of candidate's experience",
  "projectComplexity": "Low|Medium|High",
  "suggestedLevel": "Beginner|Intermediate|Experienced",
  "confidence": "High|Medium|Low",
  "reasoning": "Explanation of the assessment"
}

IMPORTANT:
- Match detected skills with required skills where possible
- Assess skills depth based on years and type of experience
- Project complexity: Low (simple projects), Medium (standard projects), High (complex, large-scale)
- Suggested level should reflect overall experience
- Confidence: High if clear indicators, Medium if some ambiguity, Low if unclear
`;

    try {
      const text = await this.callWithRetry(prompt);

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw createError(500, "Failed to parse AI response as JSON");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validated = resumeAnalysisOutputSchema.parse(parsed);

      return validated;
    } catch (error) {
      console.error("[GeminiAI.analyzeResume]", error);
      if (error instanceof Error && error.message.includes("validation")) {
        throw createError(
          500,
          `Resume analysis validation failed: ${error.message}`,
        );
      }
      // Offline fallback — extract what we can from the resume text
      console.warn("[GeminiAI] Using offline fallback for resume analysis");
      const textLower = resumeText.toLowerCase();
      const detected = requiredSkills.filter((s) =>
        textLower.includes(s.toLowerCase()),
      );
      const matchRatio = detected.length / Math.max(requiredSkills.length, 1);
      const level =
        matchRatio > 0.6
          ? "Experienced"
          : matchRatio > 0.3
            ? "Intermediate"
            : "Beginner";
      return {
        detectedSkills:
          detected.length > 0 ? detected : requiredSkills.slice(0, 2),
        skillsDepth: matchRatio > 0.5 ? SkillDepth.MEDIUM : SkillDepth.LOW,
        experienceSummary:
          "Offline analysis — Gemini API quota exceeded. Basic keyword matching was used.",
        projectComplexity: SkillDepth.MEDIUM,
        suggestedLevel: level as any,
        confidence: "Low" as const,
        reasoning:
          "Automated fallback: Gemini API was unavailable. Resume was matched by keyword only.",
      };
    }
  }

  async generateTask(
    jobTitle: string,
    requiredSkills: string[],
    inferredLevel: SkillLevel,
    jobDescription?: string,
  ): Promise<{ taskName: string; taskDescription: string }> {
    this.ensureReady();
    const prompt = `
You are an expert at creating skill assessment tasks for job candidates. Generate a single, clear, explanation-based task (NOT a multiple-choice question) that tests the candidate's understanding of the required skills.

JOB TITLE: ${jobTitle}
REQUIRED SKILLS: ${requiredSkills.join(", ")}
CANDIDATE LEVEL: ${inferredLevel}
JOB DESCRIPTION: ${jobDescription || "Not provided"}

Create a structured 3-part assessment task:

1. **Part 1: Conceptual Understanding**
   - Ask a deep conceptual question about the core skills.
   - Require explanation of "why" and "how".

2. **Part 2: Coding Challenge**
   - Ask the candidate to write a specific function, component, or query relative to ${jobTitle}.
   - Example: "Write a React component that...", "Write a MongoDB aggregation pipeline that...", "Implement a function to..."
   - Warning: Do NOT ask for a full app, just a focused snippet.

3. **Part 3: Scenario/Problem Solving**
   - Present a real-world production issue or architectural decision.
   - Ask how they would solve it.

Respond ONLY with a JSON object:
{
  "taskName": "Brief task name",
  "taskDescription": "Full markdown-formatted task description containing all 3 parts clearly separated."
}
`;

    try {
      const text = await this.callWithRetry(prompt);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw createError(500, "Failed to parse task generation response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.taskName || !parsed.taskDescription) {
        throw createError(500, "Invalid task structure from AI");
      }

      return {
        taskName: parsed.taskName,
        taskDescription: parsed.taskDescription,
      };
    } catch (error) {
      console.error("[GeminiAI.generateTask]", error);
      // Offline fallback — generate a reasonable default task
      console.warn("[GeminiAI] Using offline fallback for task generation");
      const skillsList = requiredSkills.join(", ");
      return {
        taskName: `${jobTitle} — Practical Assessment`,
        taskDescription: `You are applying for the role of ${jobTitle}. The key skills for this position are: ${skillsList}.\n\nPlease explain in detail:\n\n1. How would you approach building a real-world project that uses ${requiredSkills[0] || "the required skills"}? Describe your architecture decisions, the tools you would choose, and why.\n\n2. What are common challenges when working with ${requiredSkills.slice(0, 3).join(" and ")}? How do you handle them in practice?\n\n3. Describe a past project or scenario where you applied these skills. What was the outcome?\n\nBe specific, use examples, and show depth of understanding. Your answer will be evaluated on clarity, technical accuracy, and practical reasoning.`,
      };
    }
  }

  async evaluateAnswer(
    task: string,
    candidateAnswer: string,
    behaviorMetrics: BehaviorMetrics,
    requiredSkills: string[],
    inferredLevel: SkillLevel,
  ): Promise<EvaluationOutput> {
    this.ensureReady();
    const prompt = `
You are an expert technical interviewer evaluating a candidate's understanding of a skill.

TASK GIVEN:
${task}

CANDIDATE'S ANSWER:
${candidateAnswer}

CANDIDATE'S INFERRED LEVEL: ${inferredLevel}
REQUIRED SKILLS: ${requiredSkills.join(", ")}

BEHAVIOR METRICS:
- Total Time: ${behaviorMetrics.totalTimeSeconds} seconds
- Delay Before Typing: ${behaviorMetrics.delayBeforeTypingSeconds} seconds
- Typing Duration: ${behaviorMetrics.typingDurationSeconds} seconds
- Idle Time: ${behaviorMetrics.idleTimeSeconds} seconds
- Answer Length: ${behaviorMetrics.answerLength} characters
- Tab Switches: ${behaviorMetrics.tabSwitchCount}
- Window Blurs: ${behaviorMetrics.windowBlurCount}
- Copy Attempts: ${behaviorMetrics.copyAttemptCount}
- Focus Losses: ${behaviorMetrics.focusLossCount}

Evaluate the answer based on:
1. Concept clarity - does the answer show clear understanding?
2. Depth of understanding - does it go beyond surface level?
3. Logical structure - is the reasoning well-organized?
4. Real-world reasoning - does it show practical thinking?
5. Communication quality - is it well-articulated?
6. Thinking approach - structured, semi-structured, or random?
7. Time efficiency - was the time spent appropriate?
8. Coding Quality - is the code snippet (if requested) correct, efficient, and clean?

If the task included a coding challenge, weight the code correctness heavily (40%).


Respond ONLY with valid JSON (no markdown):
{
  "explanationScore": 0-10,
  "approachQuality": "Structured|Semi-structured|Random",
  "thinkingStyle": "Description of thinking style",
  "timeEfficiency": "Fast|Balanced|Slow",
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "verdict": "Understands well|Surface-level|Needs improvement",
  "confidenceInsight": "Assessment of candidate's actual vs claimed confidence"
}

Score 0-10:
- 9-10: Expert level, exceptional understanding
- 7-8: Strong grasp, good depth
- 5-6: Acceptable understanding, some gaps
- 3-4: Surface level, significant gaps
- 0-2: Lacks understanding, confusion

Be fair but rigorous in evaluation.
`;

    try {
      const text = await this.callWithRetry(prompt);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw createError(500, "Failed to parse evaluation response");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validated = evaluationOutputSchema.parse(parsed);

      return validated;
    } catch (error) {
      console.error("[GeminiAI.evaluateAnswer]", error);
      if (error instanceof Error && error.message.includes("validation")) {
        throw createError(
          500,
          `Evaluation validation failed: ${error.message}`,
        );
      }
      // Offline fallback — basic heuristic evaluation
      console.warn("[GeminiAI] Using offline fallback for answer evaluation");
      const len = candidateAnswer.length;
      const score = len > 1000 ? 7 : len > 500 ? 5 : len > 200 ? 4 : 2;
      return {
        explanationScore: score,
        approachQuality:
          len > 500 ? ApproachQuality.SEMI_STRUCTURED : ApproachQuality.RANDOM,
        thinkingStyle: "Evaluated offline — Gemini API unavailable",
        timeEfficiency: TimeEfficiency.BALANCED,
        strengths: ["Candidate submitted an answer"],
        weaknesses: ["Could not perform AI evaluation — offline fallback used"],
        verdict:
          score >= 5
            ? EvaluationVerdict.SURFACE_LEVEL
            : EvaluationVerdict.NEEDS_IMPROVEMENT,
        confidenceInsight:
          "Offline evaluation — re-evaluate when AI is available",
      };
    }
  }

  async generateSkillProofReportText(
    candidateName: string,
    jobTitle: string,
    inferredLevel: SkillLevel,
    taskGiven: string,
    answerSummary: string,
    evaluation: EvaluationOutput,
    behaviorMetrics: BehaviorMetrics,
    integrityStatus: string,
    confidenceAssessment: string,
  ): Promise<string> {
    this.ensureReady();
    const prompt = `
Generate a professional, human-readable skill proof report for an HR hiring platform. This is NOT a certificate, but a detailed assessment report.

CANDIDATE NAME: ${candidateName}
JOB POSITION: ${jobTitle}
INFERRED SKILL LEVEL: ${inferredLevel}

TASK GIVEN:
${taskGiven}

CANDIDATE'S ANSWER SUMMARY:
${answerSummary}

AI EVALUATION:
- Score: ${evaluation.explanationScore}/10
- Verdict: ${evaluation.verdict}
- Approach Quality: ${evaluation.approachQuality}
- Thinking Style: ${evaluation.thinkingStyle}
- Time Efficiency: ${evaluation.timeEfficiency}
- Strengths: ${evaluation.strengths.join(", ")}
- Weaknesses: ${evaluation.weaknesses.join(", ")}

BEHAVIOR METRICS:
- Total Time: ${behaviorMetrics.totalTimeSeconds} seconds
- Tab Switches: ${behaviorMetrics.tabSwitchCount}
- Window Blurs: ${behaviorMetrics.windowBlurCount}

INTEGRITY STATUS: ${integrityStatus}
CONFIDENCE ASSESSMENT: ${confidenceAssessment}

Generate a professional, plain-English report paragraph (2-3 paragraphs) summarizing:
1. Overall skill assessment
2. Key strengths and weaknesses
3. Thinking and behavioral insights
4. Final recommendation

Make it suitable for HR to read and share with hiring managers. Avoid jargon.
`;

    try {
      return await this.callWithRetry(prompt);
    } catch (error) {
      console.error("[GeminiAI.generateReport]", error);
      // Offline fallback — build a basic report from the data we have
      console.warn("[GeminiAI] Using offline fallback for report generation");
      return `Skill Proof Report for ${candidateName} — ${jobTitle}\n\nThe candidate was assessed at the ${inferredLevel} level. Their evaluation score was ${evaluation.explanationScore}/10 with a verdict of "${evaluation.verdict}". Approach quality: ${evaluation.approachQuality}. Time efficiency: ${evaluation.timeEfficiency}.\n\nStrengths: ${evaluation.strengths.join(", ") || "None identified"}. Weaknesses: ${evaluation.weaknesses.join(", ") || "None identified"}.\n\nIntegrity status: ${integrityStatus}. Confidence assessment: ${confidenceAssessment}.\n\nNote: This report was generated using an offline fallback because the AI service was temporarily unavailable. A full AI-powered evaluation can be requested once the service is restored.`;
    }
  }
}

export const geminiAIService = new GeminiAIService();
