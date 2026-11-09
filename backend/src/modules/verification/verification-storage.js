import { v2 as cloudinary } from "cloudinary";
import { createError } from "../../utils/app-error.js";
import { MAX_IMAGE_BYTES } from "./verification-images.js";

export const ASSET_FOLDER = "saheli_safar/verification";
export const ASSET_PREFIX = `${ASSET_FOLDER}/`;
const unavailable = () => createError("Secure document storage is unavailable. Please try again later.", 503);
export function createVerificationStorage({ sdk = cloudinary, env = process.env, fetchImpl = fetch } = {}) {
  const options = () => {
    const { CLOUDINARY_CLOUD_NAME: cloud_name, CLOUDINARY_API_KEY: api_key, CLOUDINARY_API_SECRET: api_secret } = env;
    if (!cloud_name || !api_key || !api_secret || !/^[a-zA-Z0-9_-]+$/.test(cloud_name)) throw unavailable();
    return { cloud_name, api_key, api_secret, secure: true, upload_prefix: "https://api.cloudinary.com" };
  };
  const assertAsset = asset => {
    if (!asset || !/^saheli_safar\/verification\/[a-f0-9-]+\/(cnic|selfie)-[a-f0-9-]+$/.test(asset.publicId) || asset.deliveryType !== "authenticated" || asset.resourceType !== "image" || asset.format !== "jpg") throw unavailable();
  };
  const storage = {
    available() { try { options(); return env.VERIFICATION_SUBMISSIONS_ENABLED === "true"; } catch { return false; } },
    assertAvailable() { if (!storage.available()) throw unavailable(); },
    async upload(asset, buffer) {
      storage.assertAvailable(); assertAsset(asset);
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = sdk.uploader.upload_stream({ ...options(), resource_type: "image", type: "authenticated", public_id: asset.publicId,
            asset_folder: ASSET_FOLDER, use_asset_folder_as_public_id_prefix: false,
            overwrite: false, unique_filename: false, use_filename: false, backup: false, format: "jpg", timeout: 25000 }, (error, result) => error ? reject(error) : resolve(result));
          stream.on("error", reject); stream.end(buffer);
        });
        if (result?.type !== "authenticated" || result.resource_type !== "image" || result.public_id !== asset.publicId || !["jpg", "jpeg"].includes(result.format)) throw unavailable();
      } catch { throw unavailable(); }
    },
    async remove(asset) {
      assertAsset(asset);
      try {
        const result = await sdk.uploader.destroy(asset.publicId, { ...options(), type: "authenticated", resource_type: "image", invalidate: true });
        if (!["ok", "not found"].includes(result?.result)) throw unavailable();
      } catch { throw unavailable(); }
    },
    async read(asset) {
      assertAsset(asset);
      try {
        // A short-lived Upload API URL stays ONLY on the server. Never redirect
        // clients to it or use a permanent signed CDN delivery URL.
        const url = sdk.utils.private_download_url(asset.publicId, "jpg", { ...options(), resource_type: "image", type: "authenticated", expires_at: Math.floor(Date.now() / 1000) + 30, attachment: false });
        if (new URL(url).origin !== "https://api.cloudinary.com") throw unavailable();
        const response = await fetchImpl(url, { redirect: "error", signal: AbortSignal.timeout(15000), cache: "no-store" });
        if (!response.ok || !response.headers.get("content-type")?.startsWith("image/jpeg") || Number(response.headers.get("content-length")) > MAX_IMAGE_BYTES) throw unavailable();
        const reader = response.body.getReader(), chunks = []; let bytes = 0;
        try { while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > MAX_IMAGE_BYTES) throw unavailable(); chunks.push(Buffer.from(value)); } }
        finally { await reader.cancel(); }
        return Buffer.concat(chunks);
      } catch { throw createError("Unable to retrieve this document. Please retry.", 503); }
    },
  };
  return storage;
}
