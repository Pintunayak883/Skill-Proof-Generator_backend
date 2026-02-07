import { Request, Response } from "express";
import { jobPositionService } from "../services/JobPositionService";
import { testLinkService } from "../services/TestLinkService";
import { createJobPositionSchema, generateTestLinkSchema } from "../validators";
import { config } from "../config";

export class JobPositionController {
  async createJobPosition(req: Request, res: Response) {
    try {
      if (!req.hrUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validatedData = createJobPositionSchema.parse(req.body);
      const position = await jobPositionService.createJobPosition(
        req.hrUser.id,
        validatedData.title,
        validatedData.requiredSkills,
        validatedData.experienceLevel,
        validatedData.description,
      );

      res.status(201).json({
        message: "Job position created",
        position: {
          id: position._id,
          title: position.title,
          requiredSkills: position.requiredSkills,
          experienceLevel: position.experienceLevel,
          description: position.description,
          createdAt: position.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create job position" });
    }
  }

  async getJobPositions(req: Request, res: Response) {
    try {
      if (!req.hrUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const positions = await jobPositionService.getJobPositionsByHRUser(
        req.hrUser.id,
      );

      res.status(200).json({
        positions: positions.map((p) => ({
          id: p._id,
          title: p.title,
          requiredSkills: p.requiredSkills,
          experienceLevel: p.experienceLevel,
          description: p.description,
          createdAt: p.createdAt,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job positions" });
    }
  }

  async getJobPositionById(req: Request, res: Response) {
    try {
      if (!req.hrUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const position = await jobPositionService.getJobPositionById(
        req.params.id,
      );
      if (!position) {
        return res.status(404).json({ error: "Job position not found" });
      }

      res.status(200).json({
        position: {
          id: position._id,
          title: position.title,
          requiredSkills: position.requiredSkills,
          experienceLevel: position.experienceLevel,
          description: position.description,
          createdAt: position.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job position" });
    }
  }

  async generateTestLink(req: Request, res: Response) {
    try {
      if (!req.hrUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validatedData = generateTestLinkSchema.parse(req.body);

      // Verify job position exists
      const position = await jobPositionService.getJobPositionById(
        validatedData.jobPositionId,
      );
      if (!position) {
        return res.status(404).json({ error: "Job position not found" });
      }

      const testLink = await testLinkService.generateTestLink(
        validatedData.jobPositionId,
        req.hrUser.id,
        validatedData.expiryDays,
      );

      res.status(201).json({
        message: "Test link generated",
        testLink: {
          id: testLink._id,
          token: testLink.uniqueToken,
          expiryDate: testLink.expiryDate,
          testUrl: `${config.frontendUrl}/test/${testLink.uniqueToken}`,
          createdAt: testLink.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate test link" });
    }
  }

  async getTestLinks(req: Request, res: Response) {
    try {
      if (!req.hrUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const testLinks = await testLinkService.getTestLinksByHRUser(
        req.hrUser.id,
      );

      res.status(200).json({
        testLinks: testLinks.map((link) => ({
          id: link._id,
          jobPositionId: link.jobPositionId,
          token: link.uniqueToken,
          expiryDate: link.expiryDate,
          isExpired: link.isExpired,
          createdAt: link.createdAt,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch test links" });
    }
  }

  async revokeTestLink(req: Request, res: Response) {
    try {
      if (!req.hrUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await testLinkService.revokeTestLink(req.params.linkId, req.hrUser.id);

      res.status(200).json({
        message: "Test link revoked",
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to revoke test link" });
    }
  }
}

export const jobPositionController = new JobPositionController();
