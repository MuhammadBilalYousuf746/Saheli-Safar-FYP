
import { StyleSheet } from "react-native";
import { typography } from "../../../theme/typography";

const C = {
  plum: "#552D50",
  dark: "#382039",
  lavender: "#9473AE",
  rose: "#C98291",
  muted: "#827982",
  ivory: "#FCF9F6",
  white: "#FFFFFF",
  border: "#E8DDE8",
  ink: "#392C3C",
  success: "#27836B",
  error: "#C44555",
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.ivory,
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 22,
    justifyContent: "space-between",
  },

  contentCompact: {
    paddingTop: 10,
    paddingBottom: 12,
  },

  contentKeyboard: {
    paddingTop: 8,
    paddingBottom: 8,
  },

  header: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.white,
    borderColor: C.border,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    fontSize: 32,
    lineHeight: 37,
    marginTop: -3,
    color: C.plum,
  },

  headerLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: C.plum,
  },

  main: {
    flexShrink: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  stepLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: C.rose,
  },

  title: {
    marginTop: 14,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 39,
    lineHeight: 48,
    letterSpacing: -1,
    color: C.dark,
    includeFontPadding: false,
  },

  titleKeyboard: {
    marginTop: 0,
    fontSize: 28,
    lineHeight: 36,
  },

  titleAccent: {
    color: C.lavender,
  },

  description: {
    marginTop: 13,
    maxWidth: 315,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 21,
    color: "#766D78",
  },

  form: {
    marginTop: 35,
    width: "100%",
  },

  formCompact: {
    marginTop: 20,
  },

  formKeyboard: {
    marginTop: 12,
  },

  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: C.ink,
    marginBottom: 10,
  },

  confirmLabel: {
    marginTop: 23,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: C.ink,
    marginBottom: 10,
  },

  inputWrap: {
    height: 56,
    borderRadius: 17,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },

  inputFocused: {
    borderColor: C.lavender,
    backgroundColor: "#FFFCFF",
  },

  inputError: {
    borderColor: "#E2A4AD",
  },

  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    color: C.ink,
  },

  showButton: {
    paddingHorizontal: 5,
    paddingVertical: 10,
  },

  showText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.lavender,
  },

  requirements: {
    marginTop: 15,
    gap: 7,
  },

  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  requirementIcon: {
    width: 17,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: "#B6A8B8",
  },

  requirementMet: {
    color: C.success,
  },

  requirementText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: C.muted,
  },

  requirementTextMet: {
    color: C.success,
  },

  matchMessage: {
    marginTop: 9,
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
  },

  matchSuccess: {
    color: C.success,
  },

  matchError: {
    color: C.error,
  },

  footer: {
    paddingBottom: 3,
  },

  resetButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: C.plum,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  resetDisabled: {
    backgroundColor: "#AA96A9",
  },

  resetPressed: {
    backgroundColor: C.dark,
    transform: [{ scale: 0.985 }],
  },

  resetText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: C.white,
  },

  arrowCircle: {
    position: "absolute",
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
  },

  arrowText: {
    fontSize: 20,
    lineHeight: 23,
    marginTop: -2,
    color: C.white,
  },

  footerNote: {
    marginTop: 27,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 1.2,
    color: C.lavender,
  },
});

export default styles;
