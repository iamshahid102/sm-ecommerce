import { randomUUID } from "node:crypto";

import { getSupabaseAdmin } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";

const BUCKETS = {
  product: "product-images",
  cms: "cms-assets",
  site: "site-assets",
};

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadImage({
  bucket = "product",
  buffer,
  mimetype,
  folder,
}) {
  const bucketName = BUCKETS[bucket] ?? BUCKETS.product;
  const extension = EXTENSIONS[mimetype];

  if (!extension) {
    throw new ApiError(
      422,
      "Only JPEG, PNG, and WebP images are allowed.",
      "INVALID_FILE_TYPE",
    );
  }

  const path = `${folder || "uploads"}/${Date.now()}-${randomUUID()}.${extension}`;
  const admin = getSupabaseAdmin();
  const { error } = await admin.storage
    .from(bucketName)
    .upload(path, buffer, { contentType: mimetype, upsert: false });

  if (error) {
    throw new ApiError(500, "Image upload failed.", "UPLOAD_FAILED");
  }

  const { data } = admin.storage.from(bucketName).getPublicUrl(path);

  return { path, url: data.publicUrl, bucket: bucketName };
}

export async function deleteImage(bucket, path) {
  const bucketName = BUCKETS[bucket] ?? BUCKETS.product;
  const { error } = await getSupabaseAdmin()
    .storage.from(bucketName)
    .remove([path]);

  if (error) {
    throw new ApiError(500, "Image delete failed.", "DELETE_FAILED");
  }
}
