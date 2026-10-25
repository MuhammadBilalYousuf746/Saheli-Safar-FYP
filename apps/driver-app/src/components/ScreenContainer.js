import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import { layout } from "../theme/spacing";

/**
 * Shared screen layout for the Driver App.
 * Safe area, dark background, optional scrolling and keyboard avoidance.
 */
export default function ScreenContainer({
  children,
  scrollable = true,
  padded = true,
  contentStyle,
  refreshControl,
  footer,
}) {
  const body = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        padded && styles.padded,
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, padded && styles.padded, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {body}
        {footer && (
          <View style={[styles.footer, padded && styles.padded]}>
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingBottom: 24,
  },

  content: {
    flex: 1,
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
  },

  padded: {
    paddingHorizontal: layout.screenPadding,
  },

  footer: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
});
