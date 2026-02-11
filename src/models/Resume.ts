import mongoose, { Schema, Document } from "mongoose";

export interface IResume extends Document {
  candidateId: mongoose.Types.ObjectId;
  fileName: string;
  fileType: "pdf" | "docx";
  resumeUrl: string; // UploadThing URL
  fileKey: string; // UploadThing file key for deletion
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
    resumeUrl: { type: String, required: true }, // UploadThing file URL
    fileKey: { type: String, required: true }, // UploadThing file key for deletion
    rawText: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const Resume = mongoose.model<IResume>("Resume", resumeSchema);
