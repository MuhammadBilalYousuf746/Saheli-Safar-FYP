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
    marginTop: 14,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 39,
    lineHeight: 48,
    letterSpacing: -1,
    color: colors.textPrimary,
    includeFontPadding: false
  },
  titleKeyboard: {
    marginTop: 0,
    fontSize: 28,
    lineHeight: 36
  },
  titleAccent: {
    color: colors.primaryLight
  },
  description: {
    marginTop: 13,
    maxWidth: 315,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary
  },
  form: {
    marginTop: 35,
    width: "100%"
  },
  formCompact: {
    marginTop: 20
  },
  formKeyboard: {
    marginTop: 12
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.4,
    color: colors.textSecondary,
    marginBottom: 10
  },
  confirmLabel: {
    marginTop: 23,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.4,
    color: colors.textSecondary,
    marginBottom: 10
  },
  inputWrap: {
    height: 58,
    borderRadius: 16,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center"
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
    paddingVertical: 0,
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    color: colors.textPrimary
  },
  showButton: {
    paddingHorizontal: 5,
    paddingVertical: 10
  },
  showText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primaryLight
  },
  requirements: {
    marginTop: 15,
    gap: 7
  },
  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  requirementIcon: {
    width: 17,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: colors.textMuted
  },
  requirementMet: {
    color: colors.success
  },
  requirementText: {
    lineHeight: 20,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted
  },
  requirementTextMet: {
    color: colors.success
  },
  matchMessage: {
    marginTop: 9,
    fontFamily: typography.fontFamily.medium,
    fontSize: 12
  },
  matchSuccess: {
    color: colors.success
  },
  matchError: {
    color: colors.error
  },
  footer: {
    flexShrink: 0,
    paddingBottom: 3
  },
  resetButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  resetDisabled: {
    backgroundColor: colors.buttonDisabled
  },
  resetPressed: {
    backgroundColor: colors.buttonPressed,
    transform: [{
      scale: 0.985
    }]
  },
  resetText: {
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
