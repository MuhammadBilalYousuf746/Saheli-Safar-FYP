import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { layout, radius } from "../theme/spacing";

// variant: "primary" (marigold) | "secondary" (outlined) | "ghost" (text only)
export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && !isDisabled && styles[`${variant}Pressed`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.onPrimary : colors.primary}
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: layout.buttonHeight,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  primary: {
    backgroundColor: colors.primary,
  },

  primaryPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.985 }],
  },

  secondary: {
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  secondaryPressed: {
    borderColor: colors.primary,
  },

  ghost: {
    backgroundColor: colors.transparent,
  },

  ghostPressed: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.45,
  },

  text: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
  },

  primaryText: {
    color: colors.onPrimary,
  },

  secondaryText: {
    color: colors.textPrimary,
  },

  ghostText: {
    color: colors.primary,
  },
});
