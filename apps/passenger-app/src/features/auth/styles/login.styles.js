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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 18,
    justifyContent: "center"
  },
  contentCompact: {
    paddingTop: 10,
    paddingBottom: 10
  },
  contentKeyboard: {
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: "flex-start"
  },
  middle: {
    flexShrink: 0,
    justifyContent: "center"
  },
  middleKeyboard: {
    justifyContent: "center"
  },
  artwork: {
    height: 204,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  artworkCompact: {
    height: 160,
    marginTop: 0
  },
  artworkTiny: {
    height: 110
  },
  intro: {
    marginTop: 16
  },
  introKeyboard: {
    marginTop: 0
  },
  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.8,
    color: colors.accent
  },
  title: {
    marginTop: 7,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 37,
    lineHeight: 46,
    letterSpacing: -0.9,
    color: colors.textPrimary,
    includeFontPadding: false
  },
  titleKeyboard: {
    fontSize: 28,
    lineHeight: 36,
    marginTop: 0
  },
  titleAccent: {
    color: colors.primaryLight
  },
  description: {
    marginTop: 8,
    maxWidth: 315,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary
  },
  form: {
    marginTop: 24
  },
  formCompact: {
    marginTop: 20
  },
  formKeyboard: {
    marginTop: 10
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.4,
    color: colors.textSecondary,
    marginBottom: 9
  },
  inputWrap: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14
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
    height: 25,
    width: 1,
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
  passwordHeader: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  forgotText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primaryLight,
    marginBottom: 9
  },
  eyeButton: {
    paddingHorizontal: 6,
    paddingVertical: 10
  },
  eyeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primaryLight
  },
  actions: {
    marginTop: 24,
    flexShrink: 0
  },
  footer: {
    marginTop: 32,
    paddingBottom: 3,
    flexShrink: 0
  },
  error: {
    color: colors.error,
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12
  },
  loginButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  loginDisabled: {
    backgroundColor: colors.buttonDisabled
  },
  loginPressed: {
    backgroundColor: colors.buttonPressed,
    transform: [{
      scale: 0.985
    }]
  },
  loginText: {
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
  registerRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "wrap"
  },
  registerPrompt: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted
  },
  registerLink: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: colors.primary
  },
  footerNote: {
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.primaryLight
  }
});

export default styles;
