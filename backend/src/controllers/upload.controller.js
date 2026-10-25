import { deleteImage, uploadImage } from "../services/storage.service.js";
import { recordAudit } from "../services/audit.service.js";
import { uploadSchema } from "../validators/cms.validator.js";
import { sendSuccess } from "../utils/http.js";
import { z } from "zod";

const deleteSchema = z
  .object({
    bucket: z.enum(["product", "cms", "site"]),
    path: z
      .string()
      .trim()
      .min(1)
      .max(300)
      .regex(/^[a-z0-9/_.-]+$/i, "Invalid storage path."),
  })
  .strict();

export async function uploadImages(req, res) {
  const files = req.files ?? [];
  if (files.length === 0) {
    return sendSuccess(res, { images: [] }, { message: "No images uploaded." });
  }

  const options = uploadSchema.parse(req.body ?? {});
  const images = [];

  for (const file of files) {
    images.push(
      await uploadImage({
        bucket: options.bucket,
        folder: options.folder,
        buffer: file.buffer,
        mimetype: file.mimetype,
      }),
    );
  }

  await recordAudit({
    actor: req.user,
    action: "image.upload",
    entityType: "storage",
    entityId: images[0]?.path,
    changes: { count: images.length, bucket: options.bucket },
    req,
  });

  return sendSuccess(res, { images }, {
    status: 201,
    message: `${images.length} image(s) uploaded.`,
  });
}

export async function removeUpload(req, res) {
  const input = deleteSchema.parse(req.body ?? {});
  await deleteImage(input.bucket, input.path);
  await recordAudit({
    actor: req.user,
    action: "image.delete",
    entityType: "storage",
    entityId: input.path,
    changes: { bucket: input.bucket },
    req,
  });
  return sendSuccess(res, { path: input.path }, { message: "Image deleted." });
}
