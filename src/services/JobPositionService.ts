import { JobPosition, IJobPosition } from "../models/JobPosition";
import { createError } from "../utils/errors";
import { ObjectId } from "mongoose";

export class JobPositionService {
  async createJobPosition(
    hrUserId: string | ObjectId,
    title: string,
    requiredSkills: string[],
    experienceLevel: "Beginner" | "Intermediate" | "Experienced",
    description?: string,
  ): Promise<IJobPosition> {
    const position = await JobPosition.create({
      hrUserId,
      title,
      requiredSkills,
      experienceLevel,
      description,
    });

    return position;
  }

  async getJobPositionById(id: string): Promise<IJobPosition | null> {
    return JobPosition.findById(id);
  }

  async getJobPositionsByHRUser(hrUserId: string): Promise<IJobPosition[]> {
    return JobPosition.find({ hrUserId }).sort({ createdAt: -1 });
  }

  async updateJobPosition(
    id: string,
    hrUserId: string,
    updates: Partial<IJobPosition>,
  ): Promise<IJobPosition> {
    const position = await JobPosition.findOneAndUpdate(
      { _id: id, hrUserId },
      updates,
      { new: true },
    );

    if (!position) {
      throw createError(404, "Job position not found or unauthorized");
    }

    return position;
  }

  async deleteJobPosition(id: string, hrUserId: string): Promise<void> {
    const result = await JobPosition.deleteOne({ _id: id, hrUserId });
    if (result.deletedCount === 0) {
      throw createError(404, "Job position not found or unauthorized");
    }
  }
}

export const jobPositionService = new JobPositionService();
