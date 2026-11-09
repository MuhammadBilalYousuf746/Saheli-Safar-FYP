import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";

export function releaseImage(image) {
  if (!image?.uri) return;
  try {
    if (Platform.OS === "web") { if (image.uri.startsWith("blob:")) URL.revokeObjectURL(image.uri); }
    else if (image.uri.startsWith(Paths.cache.uri.replace(/\/?$/, "/")) && /\/(ImagePicker|Camera)\//.test(image.uri) && !image.uri.includes("..")) {
      const file = new File(image.uri); if (file.exists) file.delete();
    }
  } catch { /* Never log sensitive URIs; OS-managed originals are never deleted. */ }
}
export async function selectVerificationImage(kind, camera = false) {
  if (camera && Platform.OS !== "web") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) throw new Error("Camera permission was denied. Allow camera access in device settings or choose an image from your gallery.");
  }
  const options = { mediaTypes: ["images"], allowsEditing: false, quality: 1, base64: false, exif: false, cameraType: kind === "selfie" ? ImagePicker.CameraType.front : ImagePicker.CameraType.back };
  const result = await (camera ? ImagePicker.launchCameraAsync(options) : ImagePicker.launchImageLibraryAsync(options));
  if (result.canceled || !result.assets?.[0]) return null;
  const asset = result.assets[0];
  if (Platform.OS !== "web" && !Number.isFinite(asset.fileSize)) { try { asset.fileSize = new File(asset.uri).size; } catch {} }
  return asset;
}
