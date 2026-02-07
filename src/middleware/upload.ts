import multer from "multer";
import path from "path";
import { config } from "../config";
import { createError } from "../utils/errors";
import { ensureUploadsDir } from "../utils/fileParser";
import { generateUniqueToken } from "../utils/generators";

const uploadsDir = path.join(process.cwd(), "uploads", "resumes");
ensureUploadsDir(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `${generateUniqueToken()}${ext}`;
    cb(null, fileName);
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowed = config.allowedFileTypes;
  const mimeType = file.mimetype.toLowerCase();

  if (allowed.includes("pdf") && mimeType.includes("pdf")) {
    return cb(null, true);
  }
  if (
    allowed.includes("docx") &&
    (mimeType.includes("word") || mimeType.includes("docx"))
  ) {
    return cb(null, true);
  }

  cb(createError(400, "Invalid file type. Only PDF and DOCX allowed."));
};

export const uploadResume = multer({
  storage,
  limits: { fileSize: config.maxFileSize },
  fileFilter,
});
