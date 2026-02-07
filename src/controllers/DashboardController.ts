import { Request, Response } from "express";
import { dashboardService } from "../services/DashboardService";
import { dashboardFilterSchema } from "../validators";

export class DashboardController {
  async getReports(req: Request, res: Response) {
    try {
      if (!req.hrUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const filters = dashboardFilterSchema.parse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      });

      const { reports, total } = await dashboardService.getReports(
        req.hrUser.id,
        filters,
      );

      res.status(200).json({
        reports: reports.map((report) => ({
          id: report._id,
          candidateName: report.candidateName,
          candidateEmail: report.candidateEmail,
          jobTitle: report.jobTitle,
          inferredSkillLevel: report.inferredSkillLevel,
          evaluationVerdictPlainEnglish: report.evaluationVerdictPlainEnglish,
          integrityStatus: report.integrityStatus,
          confidenceAssessment: report.confidenceAssessment,
          reportGeneratedAt: report.reportGeneratedAt,
        })),
        pagination: {
          total,
          page: filters.page,
          limit: filters.limit,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  }

  async getReportDetail(req: Request, res: Response) {
    try {
      if (!req.hrUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { report, evaluation, session } =
        await dashboardService.getReportDetail(req.hrUser.id, req.params.id);

      res.status(200).json({
        report,
        evaluation,
        session,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.status(500).json({ error: "Failed to fetch report" });
    }
  }

  async getSubmissions(req: Request, res: Response) {
    try {
      if (!req.hrUser) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : 20;

      const { submissions, total } = await dashboardService.getSubmissions(
        req.hrUser.id,
        page,
        limit,
      );

      res.status(200).json({
        submissions,
        pagination: {
          total,
          page,
          limit,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch submissions" });
    }
  }
}

export const dashboardController = new DashboardController();
