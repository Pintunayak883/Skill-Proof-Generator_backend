import { Resume, IResume } from "../models/Resume";
import { ResumeAnalysis, IResumeAnalysis } from "../models/ResumeAnalysis";
import { createError } from "../utils/errors";
import { ResumeAnalysisOutput } from "../types";
import { ObjectId } from "mongoose";
import { deleteUploadedFile } from "../lib/uploadthing";

export class ResumeService {
  /**
   * Store resume with UploadThing URL
   * No longer accepts filePath - uses resumeUrl from UploadThing instead
   */
  async storeResume(
    candidateId: string | ObjectId,
    fileName: string,
    fileType: "pdf" | "docx",
    resumeUrl: string,
    fileKey: string,
    rawText: string,
  ): Promise<IResume> {
    const resume = await Resume.create({
      candidateId,
      fileName,
      fileType,
      resumeUrl,
      fileKey,
      rawText,
    });

    return resume;
  }

  async getResumeByCandidateId(
    candidateId: string | ObjectId,
  ): Promise<IResume | null> {
    return Resume.findOne({ candidateId });
  }

  async deleteResume(resumeId: string | ObjectId): Promise<void> {
    const resume = await Resume.findById(resumeId);
    if (!resume) {
      throw createError(404, "Resume not found");
    }

    // Delete from UploadThing
    if (resume.fileKey) {
      await deleteUploadedFile(resume.fileKey);
    }

    // Delete from MongoDB
    await Resume.deleteOne({ _id: resumeId });
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
