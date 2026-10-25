import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

// Eyebrow + heading (with optional accent word) + description.
export default function ScreenIntro({ eyebrow, title, accent, description }) {
  return (
    <View style={styles.intro}>
      {!!eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}

      <Text style={styles.title}>
        {title}
        {!!accent && <Text style={styles.accent}> {accent}</Text>}
      </Text>

      {!!description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginTop: 24,
    marginBottom: 24,
  },

  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: typography.letterSpacing.eyebrow,
    color: colors.primary,
  },

  title: {
    marginTop: 8,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: typography.fontSize.heading + 2,
    lineHeight: typography.lineHeight.heading + 2,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
  },

  accent: {
    color: colors.primary,
  },

  description: {
    marginTop: 8,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});
