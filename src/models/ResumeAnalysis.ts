import mongoose, { Schema, Document } from "mongoose";
import { ResumeAnalysisOutput } from "../types";

export interface IResumeAnalysis extends Document {
  resumeId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  analysis: ResumeAnalysisOutput;
  createdAt: Date;
}

const resumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    resumeId: { type: Schema.Types.ObjectId, ref: "Resume", required: true },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    analysis: {
      detectedSkills: [String],
      skillsDepth: { type: String, enum: ["Low", "Medium", "High"] },
      experienceSummary: String,
      projectComplexity: { type: String, enum: ["Low", "Medium", "High"] },
      suggestedLevel: {
        type: String,
        enum: ["Beginner", "Intermediate", "Experienced"],
      },
      confidence: { type: String, enum: ["High", "Medium", "Low"] },
      reasoning: String,
    },
  },
  { timestamps: true },
);

export const ResumeAnalysis = mongoose.model<IResumeAnalysis>(
  "ResumeAnalysis",
  resumeAnalysisSchema,
);
