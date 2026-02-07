import { SkillSession, ISkillSession } from "../models/SkillSession";
import { createError } from "../utils/errors";
import { ObjectId } from "mongoose";

export class SkillSessionService {
  async createSkillSession(
    testLinkId: string | ObjectId,
    candidateId: string | ObjectId,
    sessionId: string,
    taskGiven: string,
    taskDescription: string,
    inferredLevel: "Beginner" | "Intermediate" | "Experienced",
  ): Promise<ISkillSession> {
    const skillSession = await SkillSession.create({
      testLinkId,
      candidateId,
      sessionId,
      taskGiven,
      taskDescription,
      inferredLevel,
      isSubmitted: false,
      testAttemptCount: 0,
    });

    return skillSession;
  }

  async getSkillSessionBySessionId(
    sessionId: string,
  ): Promise<ISkillSession | null> {
    return SkillSession.findOne({ sessionId });
  }

  async getSkillSessionById(id: string): Promise<ISkillSession | null> {
    return SkillSession.findById(id);
  }

  async getSkillSessionsByTestLink(
    testLinkId: string | ObjectId,
  ): Promise<ISkillSession[]> {
    return SkillSession.find({ testLinkId }).sort({ createdAt: -1 });
  }

  async submitAnswer(
    id: string,
    candidateAnswer: string,
    pseudoCode?: string,
    snapshots: string[] = [],
  ): Promise<ISkillSession> {
    const skillSession = await SkillSession.findByIdAndUpdate(
      id,
      {
        candidateAnswer,
        pseudoCode,
        snapshots,
        isSubmitted: true,
        submittedAt: new Date(),
      },
      { new: true },
    );

    if (!skillSession) {
      throw createError(404, "Skill session not found");
    }

    return skillSession;
  }

  async updateAttemptCount(id: string): Promise<void> {
    await SkillSession.updateOne(
      { _id: id },
      { $inc: { testAttemptCount: 1 } },
    );
  }

  async getSkillSessionByCandidateAndTestLink(
    candidateId: string | ObjectId,
    testLinkId: string | ObjectId,
  ): Promise<ISkillSession | null> {
    return SkillSession.findOne({ candidateId, testLinkId });
  }
}

export const skillSessionService = new SkillSessionService();
