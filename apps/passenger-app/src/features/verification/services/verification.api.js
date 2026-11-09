import { Platform } from "react-native";
import { File } from "expo-file-system";
import { apiRequest } from "../../../config/api";

export const VERIFICATION_LABELS = { not_submitted: "Not Submitted", pending_review: "Pending Review", approved: "Approved", rejected: "Rejected" };
export function parseVerification(response) {
  const value = response?.verification;
  if (response?.success !== true || !Object.hasOwn(VERIFICATION_LABELS, value?.status) || !Number.isInteger(value.revision) || !Array.isArray(value.documents) || value.documents.some(doc => !/^(cnic-[01]|selfie)$/.test(doc.key))) throw new Error("Unable to verify the current identity status. Please retry.");
  return { status: value.status, revision: value.revision, submissionId: value.submissionId,
    rejectionReason: typeof value.rejectionReason === "string" ? value.rejectionReason : null,
    reverificationReason: typeof value.reverificationReason === "string" ? value.reverificationReason : null,
    submissionAvailable: value.submissionAvailable === true, documentsDeleted: value.documentsDeleted === true,
    documents: value.documents.map(doc => ({ key: doc.key, kind: doc.kind })),
  };
}
export const getVerification = async owner => parseVerification(await apiRequest("/passenger/verification/me", { authenticated: true, expectedSession: owner, requireHttps: true }));
export function imageFieldError(asset) {
  if (!asset) return "Select an image.";
  if (!["image/jpeg", "image/png"].includes(asset.mimeType || asset.file?.type)) return "Choose a JPEG or PNG image.";
  const size = asset.fileSize ?? asset.file?.size;
  if (!Number.isFinite(size) || size <= 0) return "Unable to verify this image's size. Choose another image.";
  if (size > 5 * 1024 * 1024) return "Each image must be 5 MiB or smaller.";
  return "";
}
export function validateSelections(cnics, selfie) {
  return { ...(!cnics.length || cnics.length > 2 ? { cnics: "Select one or two CNIC images." } : {}),
    ...(!selfie ? { selfie: "Select one selfie image." } : {}),
    ...(cnics.some(image => imageFieldError(image)) ? { cnics: "Use JPEG/PNG images of 5 MiB or less." } : {}),
    ...(selfie && imageFieldError(selfie) ? { selfie: imageFieldError(selfie) } : {}),
  };
}
export async function submitVerification(owner, verification, cnics, selfie) {
  if (Object.keys(validateSelections(cnics, selfie)).length) throw new Error("Select one or two valid CNIC images and one valid selfie before submitting.");
  const body = new FormData(); body.append("revision", String(verification.revision));
  const append = (field, image, index) => {
    if (Platform.OS === "web") {
      const type = image.mimeType || image.file.type;
      body.append(field, image.file, `${field}-${index}.${type === "image/png" ? "png" : "jpg"}`);
    } else {
      // SDK 57 Expo fetch serializes File.bytes(), not legacy RN URI objects.
      // Recheck the current cache file before sending; never expose SDK paths.
      let file;
      try {
        if (typeof image.uri !== "string" || !image.uri) throw new Error();
        file = new File(image.uri);
        if (!file.exists || imageFieldError({ mimeType: file.type, fileSize: file.size })) throw new Error();
      } catch { throw new Error("Unable to prepare the selected image. Choose it again and retry."); }
      body.append(field, file);
    }
  };
  cnics.forEach((image, index) => append("cnic", image, index)); append("selfie", selfie, 0);
  return parseVerification(await apiRequest("/passenger/verification/submit", { method: "POST", body, multipart: true, authenticated: true, expectedSession: owner, requireHttps: true }));
}
