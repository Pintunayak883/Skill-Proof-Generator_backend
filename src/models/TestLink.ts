import mongoose, { Schema, Document } from "mongoose";

export interface ITestLink extends Document {
  jobPositionId: mongoose.Types.ObjectId;
  hrUserId: mongoose.Types.ObjectId;
  uniqueToken: string;
  expiryDate: Date;
  isExpired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testLinkSchema = new Schema<ITestLink>(
  {
    jobPositionId: {
      type: Schema.Types.ObjectId,
      ref: "JobPosition",
      required: true,
    },
    hrUserId: { type: Schema.Types.ObjectId, ref: "HRUser", required: true },
    uniqueToken: { type: String, required: true, unique: true },
    expiryDate: { type: Date, required: true },
    isExpired: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Index for finding active links
testLinkSchema.index({ uniqueToken: 1, isExpired: 1 });

export const TestLink = mongoose.model<ITestLink>("TestLink", testLinkSchema);
