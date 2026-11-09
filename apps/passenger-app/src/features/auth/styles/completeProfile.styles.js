import { colors } from "../../../theme/colors";

import { StyleSheet } from "react-native";
import { typography } from "../../../theme/typography";



const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboardContainer: {
    flex: 1
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 20
  },
  scrollCompact: {
    paddingTop: 12,
    paddingBottom: 14
  },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  progress: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center"
  },
  progressFilled: {
    width: 34,
    height: 4,
    borderRadius: 6,
    backgroundColor: colors.primary
  },
  step: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted
  },
  artwork: {
    height: 153,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  artworkCompact: {
    height: 117,
    marginTop: 5
  },
  intro: {
    marginTop: 5
  },
  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.7,
    color: colors.accent
  },
  title: {
    marginTop: 7,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 35,
    lineHeight: 44,
    letterSpacing: -0.9,
    color: colors.textPrimary,
    includeFontPadding: false
  },
  titleAccent: {
    color: colors.primaryLight
  },
  description: {
    marginTop: 7,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary
  },
  phoneBadge: {
    marginTop: 16,
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: colors.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  phoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent
  },
  phoneInfo: {
    flex: 1
  },
  phoneCaption: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.1,
    color: colors.textMuted
  },
  phoneValue: {
    marginTop: 3,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.primary
  },
  phoneLock: {
    fontSize: 20,
    color: colors.primaryLight
  },
  form: {
    marginTop: 20,
    gap: 13
  },
  fieldBlock: {
    width: "100%"
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.3,
    marginBottom: 8,
    color: colors.textSecondary
  },
  inputWrap: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 15
  },
  inputFocused: {
    borderColor: colors.focus,
    backgroundColor: colors.input
  },
  inputError: {
    borderColor: colors.error
  },
  input: {
    flex: 1,
    height: "100%",
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    paddingVertical: 0
  },
  eyeButton: {
    paddingHorizontal: 6,
    paddingVertical: 9
  },
  eyeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primaryLight
  },
  errorText: {
    marginTop: 5,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 15,
    color: colors.error
  },
  passwordHint: {
    marginTop: -6,
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  hintDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent
  },
  hintText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 20,
    color: colors.textMuted
  },
  footer: {
    marginTop: 30,
    paddingBottom: 8
  },
  createButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  createButtonInactive: {
    backgroundColor: colors.buttonDisabled
  },
  createButtonPressed: {
    backgroundColor: colors.buttonPressed,
    transform: [{
      scale: 0.985
    }]
  },
  createButtonText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16,
    color: colors.textOnPrimary
  },
  arrowCircle: {
    position: "absolute",
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.buttonDetail,
    justifyContent: "center",
    alignItems: "center"
  },
  arrowText: {
    fontSize: 20,
    lineHeight: 23,
    marginTop: -2,
    color: colors.textOnPrimary
  },
  footerNote: {
    marginTop: 15,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.primaryLight
  }
});

export default styles;
