import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
  candidateId: mongoose.Types.ObjectId;
  fileName: string;
  fileType: "pdf" | "docx";
  filePath: string;
  rawText: string;
  uploadedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
    },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ["pdf", "docx"], required: true },
    filePath: { type: String, required: true },
    rawText: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Resume = mongoose.model<IResume>("Resume", resumeSchema);
