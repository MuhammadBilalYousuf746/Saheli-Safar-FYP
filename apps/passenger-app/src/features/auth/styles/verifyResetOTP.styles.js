
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
    marginTop: 16,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 40,
    lineHeight: 49,
    letterSpacing: -1,
    color: C.dark,
    includeFontPadding: false,
  },

  titleKeyboard: {
    fontSize: 29,
    lineHeight: 38,
    marginTop: 8,
  },

  titleAccent: {
    color: C.lavender,
  },

  description: {
    marginTop: 17,
    maxWidth: 305,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 21,
    color: "#766D78",
  },

  phoneRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 14,
  },

  phoneNumber: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: C.plum,
  },

  changeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.lavender,
    textDecorationLine: "underline",
  },

  form: {
    marginTop: 46,
    width: "100%",
  },

  formCompact: {
    marginTop: 27,
  },

  formKeyboard: {
    marginTop: 20,
  },

  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: C.ink,
    marginBottom: 14,
  },

  otpContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "relative",
    width: "100%",
  },

  otpBox: {
    flex: 1,
    minWidth: 0,
    height: 57,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },

  otpBoxFilled: {
    borderColor: "#CCB5D2",
    backgroundColor: "#FCF7FC",
  },

  otpBoxActive: {
    borderColor: C.lavender,
    borderWidth: 2,
  },

  otpDigit: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 21,
    color: C.plum,
  },

  cursor: {
    position: "absolute",
    width: 2,
    height: 21,
    borderRadius: 1,
    backgroundColor: C.lavender,
  },

  hiddenInput: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.05,
    color: "transparent",
    zIndex: 10,
  },

  resendRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  resendPrompt: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: C.muted,
  },

  resendCountdown: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.lavender,
  },

  resendLink: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.plum,
  },

  footer: {
    paddingBottom: 3,
    transform: [{ translateY: -50 }],
  },

  footerKeyboard: {
    transform: [{ translateY: 0 }],
  },

  verifyButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: C.plum,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  verifyDisabled: {
    backgroundColor: "#AA96A9",
  },

  verifyPressed: {
    backgroundColor: C.dark,
    transform: [{ scale: 0.985 }],
  },

  verifyText: {
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
