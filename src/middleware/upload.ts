/**
 * Upload Middleware - DEPRECATED (local filesystem approach)
 *
 * This file is kept for reference only.
 * The application now uses UploadThing for file uploads.
 *
 * UploadThing provides:
 * - No local filesystem dependency
 * - Vercel serverless compatibility
 * - Automatic file type validation
 * - Secure file storage with URL generation
 *
 * See: src/lib/uploadthing.ts for the new implementation
 * See: src/routes/candidateRoutes.ts for updated route handlers
 */

export const uploadResume = null; // Deprecated - use UploadThing instead
