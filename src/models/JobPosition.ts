import mongoose, { Schema, Document } from "mongoose";

export interface IJobPosition extends Document {
  hrUserId: mongoose.Types.ObjectId;
  title: string;
  requiredSkills: string[];
  experienceLevel: "Beginner" | "Intermediate" | "Experienced";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobPositionSchema = new Schema<IJobPosition>(
  {
    hrUserId: { type: Schema.Types.ObjectId, ref: "HRUser", required: true },
    title: { type: String, required: true },
    requiredSkills: [{ type: String, required: true }],
    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Experienced"],
      required: true,
    },
    description: { type: String },
  },
  { timestamps: true },
);

export const JobPosition = mongoose.model<IJobPosition>(
  "JobPosition",
  jobPositionSchema,
);
