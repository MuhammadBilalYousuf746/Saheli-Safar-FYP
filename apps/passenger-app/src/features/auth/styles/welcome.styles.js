
import { StyleSheet } from "react-native";

import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

import {
  spacing,
  radius,
  layout,
} from "../../../theme/spacing";

const styles = StyleSheet.create({
  brandWordmark: {
    fontFamily: typography.fontFamily.semibold,
    color: colors.primaryLight,
    fontSize: 11,
    letterSpacing: 2.4
  },
  container: {
    flexGrow: 1
  },
  header: {
    gap: spacing.sm,
    alignItems: "center",
    paddingTop: spacing.md
  },
  logo: {
    tintColor: colors.primaryLight,
    height: 64
  },
  artworkSection: {
    height: 275,
    minHeight: 0,
    marginTop: spacing.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  artworkCompact: {
    height: 210,
    maxHeight: 235
  },
  messageSection: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: 4,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 38,
    lineHeight: 47,
    color: colors.textPrimary,
    textAlign: "center",
    letterSpacing: -0.8,
    includeFontPadding: false
  },
  titleCompact: {
    fontSize: 32,
    lineHeight: 40
  },
  titleAccent: {
    color: colors.primaryLight
  },
  description: {
    marginTop: spacing.sm,
    maxWidth: 310,
    fontFamily: typography.fontFamily.regular,
    fontSize: 15,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: "center"
  },
  dividerSpacing: {
    height: 0,
    marginTop: 0
  },
  footer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm
  },
  primaryButton: {
    height: layout.buttonHeight,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: spacing.lg
  },
  primaryButtonPressed: {
    backgroundColor: colors.buttonPressed,
    transform: [{
      scale: 0.985
    }]
  },
  primaryButtonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.base,
    color: colors.textOnPrimary
  },
  primaryArrow: {
    position: "absolute",
    right: spacing.lg,
    color: colors.textOnPrimary,
    fontSize: 23,
    lineHeight: 28,
    transform: [{
      translateY: -3
    }],
    includeFontPadding: false
  },
  secondaryButton: {
    backgroundColor: colors.backgroundDark,
    height: layout.buttonHeight,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryButtonPressed: {
    backgroundColor: colors.accentLight
  },
  secondaryButtonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sm,
    color: colors.primary
  },
  footerCaptionSpacing: {
    height: 0,
    marginTop: 0
  }
});

export default styles;
