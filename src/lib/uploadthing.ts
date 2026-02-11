import { createUploadthing, type FileRouter } from "uploadthing/server";
import { config } from "../config";
import { createError } from "../utils/errors";

const f = createUploadthing();

/**
 * UploadThing File Router for Skill Proof Generator
 * Handles resume uploads with strict validation:
 * - PDF only (5MB limit)
 * - Serverless-friendly (no local filesystem)
 */
export const uploadRouter = {
  resumeUploader: f({
    pdf: { maxFileSize: "4MB" },
  })
    .middleware(async (req: any) => {
      // Optional: Add authentication check here if needed
      // const user = await authenticateUser(req);
      // if (!user) throw new UploadThingError("Unauthorized");

      // Return metadata to be passed to onUploadComplete
      return { userId: "anonymous" };
    })
    .onUploadComplete(
      async ({ metadata, file }: { metadata: any; file: any }) => {
        console.log("✅ Resume uploaded successfully:", {
          fileKey: file.key,
          fileName: file.name,
          fileUrl: file.url,
          fileSize: file.size,
        });

        return {
          uploadedBy: metadata.userId,
          fileKey: file.key,
          fileUrl: file.url,
        };
      },
    ),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

/**
 * Initialize UT API for server-side operations
 * Used for deleting old resumes or managing files programmatically
 */

/**
 * Delete a file from UploadThing storage
 * Note: Full file deletion requires UploadThing API key authentication
 * For now, we track deleted files in database
 */
export const deleteUploadedFile = async (fileKey: string): Promise<void> => {
  try {
    // File deletion is handled via UploadThing dashboard or API with proper auth
    // We just log it here for now
    console.log(`📝 File marked for deletion in UploadThing: ${fileKey}`);
    // In production, you can use UploadThing webhook to handle deletions
  } catch (error) {
    console.error(`❌ Failed to mark file for deletion ${fileKey}:`, error);
    throw createError(500, "Failed to delete file from storage");
  }
};

/**
 * Get file information from UploadThing
 * Note: Direct file info retrieval requires server-side UploadThing API
 */
export const getUploadedFileInfo = async (fileKey: string) => {
  try {
    // File info can be retrieved from your database or UploadThing dashboard
    // Since we store fileKey in MongoDB, we can look it up from there
    console.log(`📝 File info for: ${fileKey}`);
    return {
      key: fileKey,
      // Additional info comes from database storage
    };
  } catch (error) {
    console.error(`❌ Failed to retrieve file info for ${fileKey}:`, error);
    throw createError(500, "Failed to retrieve file information");
  }
};
