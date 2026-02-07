import { Candidate, ICandidate } from "../models/Candidate";
import { createError } from "../utils/errors";
import { generateSessionId } from "../utils/generators";
import { ObjectId } from "mongoose";

export class CandidateService {
  async createCandidate(
    testLinkId: string | ObjectId,
    name: string,
    email: string,
    phone: string,
    levelSource: "resume" | "manual",
    inferredLevel: "Beginner" | "Intermediate" | "Experienced",
    inferredLevelConfidence: "High" | "Medium" | "Low",
  ): Promise<ICandidate> {
    // Check if candidate already exists for this test link
    const existingCandidate = await Candidate.findOne({
      testLinkId,
      email: email.toLowerCase(),
    });
    if (existingCandidate) {
      throw createError(409, "Candidate already registered for this test link");
    }

    const sessionId = generateSessionId();

    const candidate = await Candidate.create({
      testLinkId,
      name,
      email: email.toLowerCase(),
      phone,
      levelSource,
      inferredLevel,
      inferredLevelConfidence,
      sessionId,
    });

    return candidate;
  }

  async getCandidateById(id: string): Promise<ICandidate | null> {
    return Candidate.findById(id);
  }

  async getCandidateBySessionId(sessionId: string): Promise<ICandidate | null> {
    return Candidate.findOne({ sessionId });
  }

  async getCandidatesByTestLink(
    testLinkId: string | ObjectId,
  ): Promise<ICandidate[]> {
    return Candidate.find({ testLinkId }).sort({ createdAt: -1 });
  }

  async updateCandidate(
    id: string,
    updates: Partial<ICandidate>,
  ): Promise<ICandidate> {
    const candidate = await Candidate.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!candidate) {
      throw createError(404, "Candidate not found");
    }
    return candidate;
  }
}

export const candidateService = new CandidateService();
