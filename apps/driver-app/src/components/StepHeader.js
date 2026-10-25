import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

// Back button + segmented progress for the registration flow.
export default function StepHeader({ step, total, onBack }) {
  return (
    <View style={styles.header}>
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Text style={styles.backArrow}>‹</Text>
      </Pressable>

      {!!step && (
        <>
          <View style={styles.progress}>
            {Array.from({ length: total }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.segment,
                  index < step && styles.segmentDone,
                ]}
              />
            ))}
          </View>

          <Text style={styles.stepText}>
            {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  backPressed: {
    backgroundColor: colors.surfaceRaised,
  },

  backArrow: {
    marginTop: -3,
    fontSize: 30,
    lineHeight: 34,
    color: colors.textPrimary,
  },

  progress: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
  },

  segment: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.border,
  },

  segmentDone: {
    backgroundColor: colors.primary,
  },

  stepText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted,
  },
});
