import { Alert, Platform } from "react-native";

// ==========================================
// CROSS-PLATFORM ALERT
// ==========================================
// React Native's Alert.alert does nothing on web (react-native-web).
// This helper uses the native alert on Android/iOS and the browser
// dialog on web. Same signature as Alert.alert.
export const showAlert = (title, message, buttons, options) => {
  if (Platform.OS !== "web") {
    Alert.alert(title, message, buttons, options);
    return;
  }

  const text = [title, message].filter(Boolean).join("\n\n");

  const cancelButton = buttons?.find(
    (button) => button.style === "cancel"
  );
  const actionButton =
    buttons?.find((button) => button.style !== "cancel") ||
    buttons?.[0];

  // Two choices (e.g. Cancel / Log out): use confirm().
  if (cancelButton && actionButton && cancelButton !== actionButton) {
    if (window.confirm(text)) {
      actionButton.onPress?.();
    } else {
      cancelButton.onPress?.();
    }
    return;
  }

  window.alert(text);
  actionButton?.onPress?.();
};
