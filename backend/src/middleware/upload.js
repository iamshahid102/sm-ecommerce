import multer from "multer";

import { ApiError } from "../utils/api-error.js";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

const storage = multer.memoryStorage();

export const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter(req, file, callback) {
    if (!allowed.has(file.mimetype)) {
      callback(
        new ApiError(
          422,
          "Only JPEG, PNG, and WebP images are allowed.",
          "INVALID_FILE_TYPE",
        ),
      );
      return;
    }

    callback(null, true);
  },
});
