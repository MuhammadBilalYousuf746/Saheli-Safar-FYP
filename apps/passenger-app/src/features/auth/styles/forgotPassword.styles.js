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
    letterSpacing: 1.6,
    color: colors.primary
  },
  main: {
    flexShrink: 0,
    justifyContent: "center",
    alignItems: "flex-start"
  },
  symbolWrap: {
    width: 94,
    height: 94,
    marginBottom: 28
  },
  symbolCompact: {
    width: 72,
    height: 72,
    marginBottom: 17
  },
  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.accent
  },
  title: {
    marginTop: 13,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 39,
    lineHeight: 48,
    letterSpacing: -1,
    color: colors.textPrimary,
    includeFontPadding: false
  },
  titleKeyboard: {
    fontSize: 29,
    lineHeight: 38,
    marginTop: 0
  },
  titleAccent: {
    color: colors.primaryLight
  },
  description: {
    marginTop: 15,
    maxWidth: 310,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary
  },
  form: {
    marginTop: 42,
    width: "100%"
  },
  formCompact: {
    marginTop: 25
  },
  formKeyboard: {
    marginTop: 20
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.4,
    color: colors.textSecondary,
    marginBottom: 11
  },
  inputWrap: {
    height: 58,
    borderRadius: 16,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center"
  },
  inputFocused: {
    borderColor: colors.focus,
    backgroundColor: colors.input
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingRight: 12
  },
  flag: {
    fontSize: 18
  },
  codeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: colors.primary
  },
  separator: {
    width: 1,
    height: 25,
    backgroundColor: colors.divider,
    marginRight: 12
  },
  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    color: colors.textPrimary
  },
  validCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.successSurface,
    alignItems: "center",
    justifyContent: "center"
  },
  validCheck: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.success
  },
  helperRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  helperDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent
  },
  helperText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 20,
    color: colors.textMuted
  },
  footer: {
    flexShrink: 0,
    paddingBottom: 3
  },
  continueButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  continueDisabled: {
    backgroundColor: colors.buttonDisabled
  },
  continuePressed: {
    backgroundColor: colors.buttonPressed,
    transform: [{
      scale: 0.985
    }]
  },
  continueText: {
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
  backToLogin: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  backToLoginText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primary
  },
  footerNote: {
    marginTop: 28,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.primaryLight
  }
});

export default styles;
