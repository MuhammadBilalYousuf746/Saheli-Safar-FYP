import multer from "multer";
import sharp from "sharp";
import { createError } from "../../utils/app-error.js";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_CNIC_IMAGES = 2;
const parse = multer({ storage: multer.memoryStorage(), limits: {
  fileSize: MAX_IMAGE_BYTES, files: 3, fields: 1, fieldSize: 16, parts: 4,
}, fileFilter: (_req, file, done) => ["image/jpeg", "image/png"].includes(file.mimetype) ? done(null, true) : done(createError("Use JPEG or PNG images only.", 400))
}).fields([{ name: "cnic", maxCount: MAX_CNIC_IMAGES }, { name: "selfie", maxCount: 1 }]);

export function parseVerificationMultipart(req, res, next) {
  if (!req.is("multipart/form-data")) return next(createError("Send CNIC and selfie images as multipart form data.", 400));
  if (Number(req.get("content-length")) > 16 * 1024 * 1024) return next(createError("The document upload is too large.", 413));
  parse(req, res, error => {
    if (error || req.aborted) {
      for (const file of Object.values(req.files || {}).flat()) file.buffer?.fill(0);
      req.releaseVerificationCapacity?.();
      if (req.aborted) return;
      return next(createError(error.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MiB or smaller." : "Invalid upload fields or too many images.", error.code === "LIMIT_FILE_SIZE" ? 413 : 400));
    }
    req.setTimeout?.(0);
    req.verificationProcessing = true;
    next();
  });
}

export async function validateVerificationImages(files = {}) {
  const cnics = files.cnic || [], selfies = files.selfie || [];
  if (!cnics.length || cnics.length > 2) throw createError("Select one or two CNIC images.", 400);
  if (selfies.length !== 1) throw createError("Select one selfie image.", 400);
  if (Object.keys(files).some(key => !["cnic", "selfie"].includes(key))) throw createError("Unexpected document field.", 400);
  const normalized = [];
  try {
    for (const [kind, file] of [...cnics.map(file => ["cnic", file]), ["selfie", selfies[0]]]) {
      if (!Buffer.isBuffer(file.buffer) || !file.buffer.length) throw createError("An image is missing or empty.", 400);
      if (file.buffer.length > MAX_IMAGE_BYTES) throw createError("Each image must be 5 MiB or smaller.", 413);
      const png = file.buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
      const jpeg = file.buffer[0] === 255 && file.buffer[1] === 216 && file.buffer[2] === 255;
      if ((!png && !jpeg) || file.mimetype !== (png ? "image/png" : "image/jpeg")) throw createError("Use a genuine JPEG or PNG image with the correct file type.", 400);
      try {
        const image = sharp(file.buffer, { limitInputPixels: 12000000, failOn: "warning", animated: false });
        const metadata = await image.metadata();
        if (!["png", "jpeg"].includes(metadata.format) || (metadata.pages || 1) !== 1) throw new Error("Unsupported image");
        // Full decode + normalization rejects corrupt payloads and strips EXIF/GPS.
        const buffer = await image.rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).flatten({ background: "#ffffff" }).jpeg({ quality: 90 }).timeout({ seconds: 5 }).toBuffer();
        if (buffer.length > MAX_IMAGE_BYTES) throw new Error("Normalized image too large");
        normalized.push({ kind, buffer });
      } catch { throw createError("An image is invalid, corrupt or exceeds the 12-megapixel limit.", 400); }
    }
    return normalized;
  } catch (error) { for (const item of normalized) item.buffer.fill(0); throw error; }
}
