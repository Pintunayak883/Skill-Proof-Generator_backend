import mongoose, { Schema, Document } from "mongoose";
import { EvaluationOutput, BehaviorMetrics } from "../types";

export interface IEvaluationResult extends Document {
  skillSessionId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  testLinkId: mongoose.Types.ObjectId;
  evaluation: EvaluationOutput;
  behaviorMetrics: BehaviorMetrics;
  resumeLevelInferred?: string;
  resumeConfidenceLevel?: string;
  confidenceInsight:
    | "Overconfidence"
    | "Underconfidence"
    | "Accurate confidence";
  evaluatedAt: Date;
  createdAt: Date;
}

const evaluationResultSchema = new Schema<IEvaluationResult>(
  {
    skillSessionId: {
      type: Schema.Types.ObjectId,
      ref: "SkillSession",
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    testLinkId: {
      type: Schema.Types.ObjectId,
      ref: "TestLink",
      required: true,
    },
    evaluation: {
      explanationScore: { type: Number, min: 0, max: 10 },
      approachQuality: {
        type: String,
        enum: ["Structured", "Semi-structured", "Random"],
      },
      thinkingStyle: String,
      timeEfficiency: { type: String, enum: ["Fast", "Balanced", "Slow"] },
      strengths: [String],
      weaknesses: [String],
      verdict: {
        type: String,
        enum: ["Understands well", "Surface-level", "Needs improvement"],
      },
      confidenceInsight: String,
    },
    behaviorMetrics: {
      totalTimeSeconds: Number,
      delayBeforeTypingSeconds: Number,
      typingDurationSeconds: Number,
      idleTimeSeconds: Number,
      answerLength: Number,
      tabSwitchCount: Number,
      windowBlurCount: Number,
      copyAttemptCount: Number,
      focusLossCount: Number,
    },
    resumeLevelInferred: String,
    resumeConfidenceLevel: String,
    confidenceInsight: {
      type: String,
      enum: ["Overconfidence", "Underconfidence", "Accurate confidence"],
      required: true,
    },
    evaluatedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

evaluationResultSchema.index({ candidateId: 1, testLinkId: 1 });

export const EvaluationResult = mongoose.model<IEvaluationResult>(
  "EvaluationResult",
  evaluationResultSchema,
);
