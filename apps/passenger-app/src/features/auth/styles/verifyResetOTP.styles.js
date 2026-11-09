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
  content: {
    flexGrow: 1,
    gap: 28,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 22,
    justifyContent: "space-between"
  },
  contentCompact: {
    paddingTop: 10,
    paddingBottom: 12
  },
  contentKeyboard: {
    paddingTop: 8,
    paddingBottom: 8
  },
  header: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.primary
  },
  main: {
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  stepLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.accent
  },
  title: {
    marginTop: 16,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 40,
    lineHeight: 49,
    letterSpacing: -1,
    color: colors.textPrimary,
    includeFontPadding: false
  },
  titleKeyboard: {
    fontSize: 29,
    lineHeight: 38,
    marginTop: 8
  },
  titleAccent: {
    color: colors.primaryLight
  },
  description: {
    marginTop: 17,
    maxWidth: 305,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary
  },
  phoneRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14
  },
  phoneNumber: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: colors.primary
  },
  changeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primaryLight,
    textDecorationLine: "underline"
  },
  form: {
    marginTop: 46,
    width: "100%"
  },
  formCompact: {
    marginTop: 27
  },
  formKeyboard: {
    marginTop: 20
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.4,
    color: colors.textSecondary,
    marginBottom: 14
  },
  otpContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "relative",
    width: "100%"
  },
  otpBox: {
    flex: 1,
    minWidth: 0,
    height: 57,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center"
  },
  otpBoxFilled: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.surfaceAlt
  },
  otpBoxActive: {
    borderColor: colors.focus,
    borderWidth: 2
  },
  otpDigit: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 21,
    color: colors.textPrimary
  },
  cursor: {
    position: "absolute",
    width: 2,
    height: 21,
    borderRadius: 1,
    backgroundColor: colors.primaryLight
  },
  hiddenInput: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.05,
    color: "transparent",
    zIndex: 10
  },
  resendRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8
  },
  resendPrompt: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted
  },
  resendCountdown: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primaryLight
  },
  resendLink: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primary
  },
  footer: {
    flexShrink: 0,
    paddingBottom: 3,
    transform: [{
      translateY: -50
    }]
  },
  footerKeyboard: {
    transform: [{
      translateY: 0
    }]
  },
  verifyButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 27,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.primaryLight
  }
});

export default styles;
