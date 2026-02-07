import {
  EvaluationResult,
  IEvaluationResult,
} from "../models/EvaluationResult";
import { SkillProofReport } from "../models/SkillProofReport";
import { createError } from "../utils/errors";
import { EvaluationOutput, BehaviorMetrics } from "../types";
import { ObjectId } from "mongoose";

export class EvaluationService {
  async storeEvaluationResult(
    skillSessionId: string | ObjectId,
    candidateId: string | ObjectId,
    testLinkId: string | ObjectId,
    evaluation: EvaluationOutput,
    behaviorMetrics: BehaviorMetrics,
    resumeLevelInferred?: string,
    resumeConfidenceLevel?: string,
    confidenceInsight?:
      | "Overconfidence"
      | "Underconfidence"
      | "Accurate confidence",
  ): Promise<IEvaluationResult> {
    const evaluationResult = await EvaluationResult.create({
      skillSessionId,
      candidateId,
      testLinkId,
      evaluation,
      behaviorMetrics,
      resumeLevelInferred,
      resumeConfidenceLevel,
      confidenceInsight: confidenceInsight || "Accurate confidence",
      evaluatedAt: new Date(),
    });

    return evaluationResult;
  }

  async getEvaluationResultBySkillSession(
    skillSessionId: string | ObjectId,
  ): Promise<IEvaluationResult | null> {
    return EvaluationResult.findOne({ skillSessionId });
  }

  async getEvaluationResultsByCandidateAndTestLink(
    candidateId: string | ObjectId,
    testLinkId: string | ObjectId,
  ): Promise<IEvaluationResult[]> {
    return EvaluationResult.find({ candidateId, testLinkId }).sort({
      createdAt: -1,
    });
  }

  async generateConfidenceInsight(
    evaluationScore: number,
    resumeInferredLevel?: string,
    resumeConfidence?: string,
  ): Promise<"Overconfidence" | "Underconfidence" | "Accurate confidence"> {
    // Map levels to rough scores
    const levelScores: Record<string, number> = {
      Beginner: 4,
      Intermediate: 7,
      Experienced: 9,
    };

    if (!resumeInferredLevel) {
      return "Accurate confidence";
    }

    const resumeScore = levelScores[resumeInferredLevel] || 7;

    // Compare evaluation score with resume-inferred level
    if (evaluationScore >= resumeScore + 2) {
      return "Underconfidence"; // Performed better than inferred
    } else if (evaluationScore <= resumeScore - 2) {
      return "Overconfidence"; // Performed worse than inferred
    }

    return "Accurate confidence";
  }

  async generateSkillProofReport(
    candidateId: string | ObjectId,
    skillSessionId: string | ObjectId,
    testLinkId: string | ObjectId,
    jobPositionId: string | ObjectId,
    candidateName: string,
    candidateEmail: string,
    jobTitle: string,
    inferredSkillLevel: string,
    taskGiven: string,
    answerSummary: string,
    evaluationVerdictPlainEnglish: string,
    strengths: string[],
    weaknesses: string[],
    thinkingInsight: string,
    timeAndBehaviorInsight: string,
    integrityStatus: "Clean" | "Flagged",
    confidenceAssessment:
      | "Overconfidence"
      | "Underconfidence"
      | "Accurate confidence",
    snapshots: string[] = [],
  ) {
    try {
      console.log("[EvaluationService] Creating SkillProofReport with:", {
        candidateId,
        skillSessionId,
        integrityStatus,
        confidenceAssessment,
      });

      const report = await SkillProofReport.create({
        candidateId,
        skillSessionId,
        testLinkId,
        jobPositionId,
        candidateName,
        candidateEmail,
        jobTitle,
        inferredSkillLevel: inferredSkillLevel || "Beginner", // Fallback if undefined
        taskGiven,
        answerSummary,
        evaluationVerdictPlainEnglish,
        strengths: strengths || [],
        weaknesses: weaknesses || [],
        thinkingInsight,
        timeAndBehaviorInsight,
        integrityStatus,
        confidenceAssessment,
        snapshots,
        reportGeneratedAt: new Date(),
      });

      console.log("[EvaluationService] Usage report created:", report._id);
      return report;
    } catch (error) {
      console.error("[EvaluationService] Failed to create SkillProofReport:", error);
      throw error;
    }
  }
}

export const evaluationService = new EvaluationService();
