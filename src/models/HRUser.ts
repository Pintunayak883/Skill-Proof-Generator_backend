import mongoose, { Schema, Document } from "mongoose";
import { HRUserPayload } from "../types";

export interface IHRUser extends Document {
  name: string;
  email: string;
  password: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
}

const hrUserSchema = new Schema<IHRUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    company: { type: String, required: true },
  },
  { timestamps: true },
);

export const HRUser = mongoose.model<IHRUser>("HRUser", hrUserSchema);
