
import { StyleSheet } from "react-native";

import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

import {
  spacing,
  radius,
  layout,
} from "../../../theme/spacing";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    alignItems: "center",
    paddingTop: spacing.xs,
  },

  logo: {
    height: 80,
  },

  headerSpacing: {
    height: 32,
    marginTop: spacing.xs,
  },

  artworkSection: {
    flex: 1.2,
    minHeight: 0,
    maxHeight: 310,
    marginTop: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  artworkCompact: {
    maxHeight: 235,
  },

  messageSection: {
    flex: 0.9,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 34,
    lineHeight: 43,
    color: colors.primaryDark,
    textAlign: "center",
    letterSpacing: -0.8,
    includeFontPadding: false,
  },

  titleCompact: {
    fontSize: 29,
    lineHeight: 37,
  },

  titleAccent: {
    color: colors.primaryLight,
  },

  description: {
    marginTop: spacing.sm,
    maxWidth: 310,
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.base,
    color: colors.textSecondary,
    textAlign: "center",
  },

  dividerSpacing: {
    height: 5,
    marginTop: spacing.lg,
  },

  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },

  primaryButton: {
    height: layout.buttonHeight,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
  },

  primaryButtonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.985 }],
  },

  primaryButtonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.base,
    color: colors.textOnPrimary,
  },

  primaryArrow: {
    position: "absolute",
    right: spacing.lg,
    color: colors.white,
    fontSize: 23,
    lineHeight: 28,
    transform: [{ translateY: -3 }],
    includeFontPadding: false,
  },

  secondaryButton: {
    height: layout.buttonHeight,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonPressed: {
    backgroundColor: colors.accentLight,
  },

  secondaryButtonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },

  footerCaptionSpacing: {
    height: 25,
    marginTop: spacing.xs,
  },
});

export default styles;
