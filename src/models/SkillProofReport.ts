import mongoose, { Schema, Document } from "mongoose";

export interface ISkillProofReport extends Document {
  candidateId: mongoose.Types.ObjectId;
  skillSessionId: mongoose.Types.ObjectId;
  testLinkId: mongoose.Types.ObjectId;
  jobPositionId: mongoose.Types.ObjectId;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  inferredSkillLevel: "Beginner" | "Intermediate" | "Experienced";
  taskGiven: string;
  answerSummary: string;
  evaluationVerdictPlainEnglish: string;
  strengths: string[];
  weaknesses: string[];
  thinkingInsight: string;
  timeAndBehaviorInsight: string;
  integrityStatus: "Clean" | "Flagged";
  confidenceAssessment:
    | "Overconfidence"
    | "Underconfidence"
    | "Accurate confidence";
  snapshots: string[];
  reportGeneratedAt: Date;
  createdAt: Date;
}

const skillProofReportSchema = new Schema<ISkillProofReport>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    skillSessionId: {
      type: Schema.Types.ObjectId,
      ref: "SkillSession",
      required: true,
    },
    testLinkId: {
      type: Schema.Types.ObjectId,
      ref: "TestLink",
      required: true,
    },
    jobPositionId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosition",
      required: true,
    },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true },
    jobTitle: { type: String, required: true },
    inferredSkillLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Experienced"],
      required: true,
    },
    taskGiven: { type: String, required: true },
    answerSummary: { type: String, required: true },
    evaluationVerdictPlainEnglish: { type: String, required: true },
    strengths: [String],
    weaknesses: [String],
    thinkingInsight: { type: String, required: true },
    timeAndBehaviorInsight: { type: String, required: true },
    integrityStatus: {
      type: String,
      enum: ["Clean", "Flagged"],
      required: true,
    },
    confidenceAssessment: {
      type: String,
      enum: ["Overconfidence", "Underconfidence", "Accurate confidence"],
      required: true,
    },
    snapshots: { type: [String], default: [] },
    reportGeneratedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

skillProofReportSchema.index({ testLinkId: 1, candidateId: 1 });
skillProofReportSchema.index({ jobPositionId: 1 });

export const SkillProofReport = mongoose.model<ISkillProofReport>(
  "SkillProofReport",
  skillProofReportSchema,
);
