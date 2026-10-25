
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
 * Shared screen layout component.
 *
 * Responsibilities:
 * - Safe-area handling
 * - Consistent background
 * - Optional horizontal padding
 * - Optional scrolling
 * - Optional keyboard avoidance
 * - Maximum content width
 *
 * Used across Passenger App screens.
 */

export default function ScreenContainer({
  children,
  style,
  contentStyle,
  edges = ["top", "bottom"],
  padded = true,
  scrollable = false,
  keyboardAvoiding = false,
  backgroundColor = colors.background,
  maxWidth = layout.maxContentWidth,
}) {
  const containerStyles = [
    styles.content,
    padded && styles.padded,
    maxWidth && { maxWidth },
    contentStyle,
  ];

  const content = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.scrollContent,
        padded && styles.padded,
        maxWidth && { maxWidth },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={containerStyles}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.safeArea,
        { backgroundColor },
        style,
      ]}
    >
      {keyboardAvoiding ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
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

  content: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },

  padded: {
    paddingHorizontal: layout.screenPadding,
  },

  scrollContent: {
    flexGrow: 1,
    width: "100%",
    alignSelf: "center",
  },
});
