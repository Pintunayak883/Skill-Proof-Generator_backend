import { TestLink, ITestLink } from "../models/TestLink";
import { createError } from "../utils/errors";
import { generateUniqueToken } from "../utils/generators";
import { config } from "../config";
import { ObjectId } from "mongoose";

export class TestLinkService {
  async generateTestLink(
    jobPositionId: string | ObjectId,
    hrUserId: string | ObjectId,
    expiryDays?: number,
  ): Promise<ITestLink> {
    const uniqueToken = generateUniqueToken();
    const expiryDate = new Date();
    expiryDate.setDate(
      expiryDate.getDate() + (expiryDays || config.testLinkExpiryDays),
    );

    const testLink = await TestLink.create({
      jobPositionId,
      hrUserId,
      uniqueToken,
      expiryDate,
      isExpired: false,
    });

    return testLink;
  }

  async getTestLinkByToken(token: string): Promise<ITestLink | null> {
    const testLink = await TestLink.findOne({
      uniqueToken: token,
      isExpired: false,
    });

    // Check if link is expired
    if (testLink && testLink.expiryDate < new Date()) {
      await TestLink.updateOne({ _id: testLink._id }, { isExpired: true });
      return null;
    }

    return testLink;
  }

  async getTestLinkById(id: string): Promise<ITestLink | null> {
    return TestLink.findById(id);
  }

  async getTestLinksByJobPosition(
    jobPositionId: string | ObjectId,
  ): Promise<ITestLink[]> {
    return TestLink.find({ jobPositionId }).sort({ createdAt: -1 });
  }

  async getTestLinksByHRUser(
    hrUserId: string | ObjectId,
  ): Promise<ITestLink[]> {
    return TestLink.find({ hrUserId }).sort({ createdAt: -1 });
  }

  async revokeTestLink(id: string, hrUserId: string): Promise<void> {
    const result = await TestLink.updateOne(
      { _id: id, hrUserId },
      { isExpired: true },
    );

    if (result.matchedCount === 0) {
      throw createError(404, "Test link not found or unauthorized");
    }
  }

  async validateTestLink(token: string): Promise<ITestLink> {
    const testLink = await this.getTestLinkByToken(token);
    if (!testLink) {
      throw createError(404, "Test link is invalid or expired");
    }
    return testLink;
  }
}

export const testLinkService = new TestLinkService();
