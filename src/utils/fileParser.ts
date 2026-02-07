import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { createError } from "./errors";

export const extractTextFromFile = async (
  filePath: string,
  fileType: "pdf" | "docx",
): Promise<string> => {
  try {
    const buffer = fs.readFileSync(filePath);

    if (fileType === "pdf") {
      const data = await pdfParse(buffer);
      return data.text || "";
    }

    if (fileType === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    }

    throw createError(400, "Unsupported file type");
  } catch (error) {
    throw createError(500, "Failed to extract resume text");
  }
};

export const getFileTypeFromMime = (mimeType: string): "pdf" | "docx" => {
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("docx")) return "docx";
  throw createError(400, "Unsupported file type");
};

export const ensureUploadsDir = (uploadsPath: string) => {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
};
