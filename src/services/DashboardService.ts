import {
  SkillProofReport,
  ISkillProofReport,
} from "../models/SkillProofReport";
import {
  EvaluationResult,
  IEvaluationResult,
} from "../models/EvaluationResult";
import { JobPosition } from "../models/JobPosition";
import { TestLink } from "../models/TestLink";
import { SkillSession, ISkillSession } from "../models/SkillSession";
import { createError } from "../utils/errors";

export class DashboardService {
  async getReports(
    hrUserId: string,
    filters: {
      skillLevel?: string;
      verdict?: string;
      integrityStatus?: string;
      confidenceInsight?: string;
      page: number;
      limit: number;
    },
  ): Promise<{ reports: ISkillProofReport[]; total: number }> {
    const query: any = {};

    if (filters.skillLevel) query.inferredSkillLevel = filters.skillLevel;
    if (filters.verdict)
      query.evaluationVerdictPlainEnglish = {
        $regex: filters.verdict,
        $options: "i",
      };
    if (filters.integrityStatus)
      query.integrityStatus = filters.integrityStatus;
    if (filters.confidenceInsight)
      query.confidenceAssessment = filters.confidenceInsight;

    // Filter by HR's job positions
    const jobPositions = await JobPosition.find({ hrUserId }).select("_id");
    const jobPositionIds = jobPositions.map((j) => j._id);
    query.jobPositionId = { $in: jobPositionIds };

    const total = await SkillProofReport.countDocuments(query);
    const reports = await SkillProofReport.find(query)
      .sort({ reportGeneratedAt: -1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit);

    return { reports, total };
  }

  async getSubmissions(
    hrUserId: string,
    page: number,
    limit: number,
  ): Promise<{ submissions: IEvaluationResult[]; total: number }> {
    const jobPositions = await JobPosition.find({ hrUserId }).select("_id");
    const jobPositionIds = jobPositions.map((j) => j._id);
    const testLinks = await TestLink.find({
      jobPositionId: { $in: jobPositionIds },
    }).select("_id");
    const testLinkIds = testLinks.map((t) => t._id);

    const total = await EvaluationResult.countDocuments({
      testLinkId: { $in: testLinkIds },
    });
    const submissions = await EvaluationResult.find({
      testLinkId: { $in: testLinkIds },
    })
      .sort({ evaluatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { submissions, total };
  }

  async getReportDetail(
    hrUserId: string,
    reportId: string,
  ): Promise<{
    report: ISkillProofReport;
    evaluation: IEvaluationResult | null;
    session: ISkillSession | null;
  }> {
    const jobPositions = await JobPosition.find({ hrUserId }).select("_id");
    const jobPositionIds = jobPositions.map((j) => j._id);

    const report = await SkillProofReport.findOne({
      _id: reportId,
      jobPositionId: { $in: jobPositionIds },
    });

    if (!report) {
      throw createError(404, "Report not found");
    }

    const [evaluation, session] = await Promise.all([
      EvaluationResult.findOne({ skillSessionId: report.skillSessionId }).sort({
        createdAt: -1,
      }),
      SkillSession.findById(report.skillSessionId),
    ]);

    return { report, evaluation, session };
  }
}

export const dashboardService = new DashboardService();
