import mongoose, { Schema, Document } from "mongoose";

export interface ISkillSession extends Document {
  testLinkId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  sessionId: string;
  taskGiven: string;
  taskDescription: string;
  inferredLevel: "Beginner" | "Intermediate" | "Experienced";
  candidateAnswer: string;
  pseudoCode?: string;
  snapshots: string[];
  submittedAt: Date;
  isSubmitted: boolean;
  testAttemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const skillSessionSchema = new Schema<ISkillSession>(
  {
    testLinkId: {
      type: Schema.Types.ObjectId,
      ref: "TestLink",
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    sessionId: { type: String, required: true, unique: true },
    taskGiven: { type: String, required: true },
    taskDescription: { type: String, required: true },
    inferredLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Experienced"],
      required: true,
    },
    candidateAnswer: { type: String },
    pseudoCode: { type: String },
    snapshots: { type: [String], default: [] },
    submittedAt: { type: Date },
    isSubmitted: { type: Boolean, default: false },
    testAttemptCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

skillSessionSchema.index({ testLinkId: 1, candidateId: 1 });

export const SkillSession = mongoose.model<ISkillSession>(
  "SkillSession",
  skillSessionSchema,
);
