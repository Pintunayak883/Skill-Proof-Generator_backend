import mongoose, { Schema, Document } from "mongoose";

export interface ICandidate extends Document {
  testLinkId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  levelSource: "resume" | "manual";
  inferredLevel: "Beginner" | "Intermediate" | "Experienced";
  inferredLevelConfidence: "High" | "Medium" | "Low";
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    testLinkId: {
      type: Schema.Types.ObjectId,
      ref: "TestLink",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    levelSource: { type: String, enum: ["resume", "manual"], required: true },
    inferredLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Experienced"],
      required: true,
    },
    inferredLevelConfidence: {
      type: String,
      enum: ["High", "Medium", "Low"],
      required: true,
    },
    sessionId: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

candidateSchema.index({ testLinkId: 1, email: 1 });

export const Candidate = mongoose.model<ICandidate>(
  "Candidate",
  candidateSchema,
);
