import mongoose, { Schema, Document } from "mongoose";
import { IntegrityEventType } from "../types";

export interface IIntegrityLog extends Document {
  skillSessionId: mongoose.Types.ObjectId;
  candidateId: mongoose.Types.ObjectId;
  testLinkId: mongoose.Types.ObjectId;
  events: Array<{
    type: IntegrityEventType;
    timestamp: Date;
  }>;
  integrityStatus: "Clean" | "Flagged";
  violationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const integrityLogSchema = new Schema<IIntegrityLog>(
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
    events: [
      {
        type: {
          type: String,
          enum: [
            "TAB_SWITCH",
            "WINDOW_BLUR",
            "COPY_ATTEMPT",
            "FOCUS_LOSS",
            "IDLE_TIMEOUT",
          ],
        },
        timestamp: Date,
      },
    ],
    integrityStatus: {
      type: String,
      enum: ["Clean", "Flagged"],
      default: "Clean",
    },
    violationCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

integrityLogSchema.index({ skillSessionId: 1, candidateId: 1 });

export const IntegrityLog = mongoose.model<IIntegrityLog>(
  "IntegrityLog",
  integrityLogSchema,
);
