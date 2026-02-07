import { IntegrityLog, IIntegrityLog } from "../models/IntegrityLog";
import { IntegrityEventType } from "../types";
import { ObjectId } from "mongoose";

export class IntegrityService {
  async createIntegrityLog(
    skillSessionId: string | ObjectId,
    candidateId: string | ObjectId,
    testLinkId: string | ObjectId,
  ): Promise<IIntegrityLog> {
    const integrityLog = await IntegrityLog.create({
      skillSessionId,
      candidateId,
      testLinkId,
      events: [],
      integrityStatus: "Clean",
      violationCount: 0,
    });

    return integrityLog;
  }

  async recordIntegrityEvent(
    skillSessionId: string | ObjectId,
    eventType: IntegrityEventType,
    timestamp: Date,
  ): Promise<IIntegrityLog | null> {
    const integrityLog = await IntegrityLog.findOneAndUpdate(
      { skillSessionId },
      {
        $push: {
          events: {
            type: eventType,
            timestamp,
          },
        },
      },
      { new: true },
    );

    // Flag if too many violations
    if (integrityLog && integrityLog.events.length > 5) {
      await IntegrityLog.updateOne(
        { _id: integrityLog._id },
        {
          integrityStatus: "Flagged",
          violationCount: integrityLog.events.length,
        },
      );
    }

    return integrityLog;
  }

  async getIntegrityLogBySkillSession(
    skillSessionId: string | ObjectId,
  ): Promise<IIntegrityLog | null> {
    return IntegrityLog.findOne({ skillSessionId });
  }

  async finalizeIntegrityStatus(
    skillSessionId: string | ObjectId,
  ): Promise<"Clean" | "Flagged"> {
    const log = await IntegrityLog.findOne({ skillSessionId });
    if (!log) {
      return "Clean";
    }

    // Determine status based on violation count
    const status = log.events.length > 3 ? "Flagged" : "Clean";

    await IntegrityLog.updateOne(
      { _id: log._id },
      {
        integrityStatus: status,
        violationCount: log.events.length,
      },
    );

    return status;
  }
}

export const integrityService = new IntegrityService();
