import { Resume, IResume } from "../models/Resume";
import { ResumeAnalysis, IResumeAnalysis } from "../models/ResumeAnalysis";
import { createError } from "../utils/errors";
import { ResumeAnalysisOutput } from "../types";
import { ObjectId } from "mongoose";

export class ResumeService {
  async storeResume(
    candidateId: string | ObjectId,
    fileName: string,
    fileType: "pdf" | "docx",
    filePath: string,
    rawText: string,
  ): Promise<IResume> {
    const resume = await Resume.create({
      candidateId,
      fileName,
      fileType,
      filePath,
      rawText,
    });

    return resume;
  }

  async getResumeByCandidateId(
    candidateId: string | ObjectId,
  ): Promise<IResume | null> {
    return Resume.findOne({ candidateId });
  }

  async storeResumeAnalysis(
    resumeId: string | ObjectId,
    candidateId: string | ObjectId,
    analysis: ResumeAnalysisOutput,
  ): Promise<IResumeAnalysis> {
    const resumeAnalysis = await ResumeAnalysis.create({
      resumeId,
      candidateId,
      analysis,
    });

    return resumeAnalysis;
  }

  async getResumeAnalysisByResumeId(
    resumeId: string | ObjectId,
  ): Promise<IResumeAnalysis | null> {
    return ResumeAnalysis.findOne({ resumeId });
  }

  async getResumeAnalysisByCandidateId(
    candidateId: string | ObjectId,
  ): Promise<IResumeAnalysis | null> {
    return ResumeAnalysis.findOne({ candidateId });
  }
}

export const resumeService = new ResumeService();
