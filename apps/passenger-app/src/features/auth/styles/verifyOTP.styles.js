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
  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12
  },
  contentCompact: {
    paddingTop: 14,
    paddingBottom: 8
  },
  contentVeryCompact: {
    paddingTop: 10,
    paddingBottom: 6
  },
  contentKeyboard: {
    paddingBottom: 20
  },
  header: {
    height: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  progress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  progressFilled: {
    width: 34,
    height: 4,
    borderRadius: 5,
    backgroundColor: colors.primary
  },
  progressEmpty: {
    width: 34,
    height: 4,
    borderRadius: 5,
    backgroundColor: colors.border
  },
  step: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted
  },
  artwork: {
    height: 184,
    marginTop: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  artworkCompact: {
    height: 145,
    marginTop: 5
  },
  artworkVeryCompact: {
    height: 115,
    marginTop: 2
  },
  intro: {
    marginTop: 6
  },
  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.65,
    color: colors.accent
  },
  title: {
    marginTop: 8,
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
    marginTop: 8,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary
  },
  numberRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    paddingVertical: 9,
    paddingHorizontal: 12
  },
  numberDot: {
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: colors.accent
  },
  phoneNumber: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primary
  },
  editButton: {
    paddingHorizontal: 5,
    paddingVertical: 3
  },
  editText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primaryLight
  },
  form: {
    marginTop: 22
  },
  formCompact: {
    marginTop: 15
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.4,
    color: colors.textSecondary,
    marginBottom: 11
  },
  otpContainer: {
    height: 54,
    position: "relative"
  },
  otpRow: {
    height: 54,
    width: "100%",
    flexDirection: "row"
  },
  otpBox: {
    flex: 1,
    minWidth: 0,
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  otpBoxFilled: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.surfaceAlt
  },
  otpBoxActive: {
    borderColor: colors.focus
  },
  otpDigit: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 22,
    color: colors.textPrimary
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.05,
    color: "transparent",
    backgroundColor: "transparent",
    fontSize: 20,
    zIndex: 10
  },
  securityNote: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  securityIcon: {
    fontSize: 15,
    color: colors.accent
  },
  securityText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted
  },
  resendRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8
  },
  resendLabel: {
    flexShrink: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary
  },
  resendAction: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primary
  },
  resendDisabled: {
    color: colors.textMuted
  },
  footer: {
    marginTop: 20,
    paddingBottom: 5
  },
  footerCompact: {
    marginTop: 20
  },
  footerKeyboard: {
    marginTop: 18
  },
  verifyButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 18
  },
  verifyDisabled: {
    backgroundColor: colors.buttonDisabled
  },
  verifyPressed: {
    backgroundColor: colors.buttonPressed,
    transform: [{
      scale: 0.985
    }]
  },
  verifyText: {
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
    alignItems: "center",
    justifyContent: "center"
  },
  arrowText: {
    fontSize: 20,
    lineHeight: 23,
    marginTop: -2,
    color: colors.textOnPrimary
  },
  footerNote: {
    marginTop: 14,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.primaryLight
  }
});

export default styles;
