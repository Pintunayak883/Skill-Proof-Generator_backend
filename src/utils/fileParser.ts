import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import axios from "axios";
import { createError } from "./errors";

/**
 * Extract text from a file buffer
 * Works with both PDF and DOCX formats
 * No filesystem dependencies - serverless compatible
 */
export const extractTextFromBuffer = async (
  buffer: Buffer,
  fileType: "pdf" | "docx",
): Promise<string> => {
  try {
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
    console.error("[extractTextFromBuffer]", error);
    throw createError(500, "Failed to extract resume text");
  }
};

/**
 * Download file from UploadThing URL and extract text
 * Used when we only have the file URL, not the raw file
 */
export const extractTextFromUrl = async (
  fileUrl: string,
  fileType: "pdf" | "docx",
): Promise<string> => {
  try {
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });
    const buffer = Buffer.from(response.data);
    return extractTextFromBuffer(buffer, fileType);
  } catch (error) {
    console.error("[extractTextFromUrl]", error);
    throw createError(500, "Failed to download and extract resume text");
  }
};

/**
 * Get file type from MIME type
 * Used to determine how to process the file
 */
export const getFileTypeFromMime = (mimeType: string): "pdf" | "docx" => {
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("docx")) return "docx";
  throw createError(400, "Unsupported file type. Only PDF and DOCX allowed.");
};
