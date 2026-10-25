
import { StyleSheet } from "react-native";
import { typography } from "../../../theme/typography";

const C = {
  plum: "#552D50",
  dark: "#382039",
  lavender: "#9473AE",
  rose: "#C98291",
  ink: "#392C3C",
  muted: "#827982",
  ivory: "#FCF9F6",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.ivory,
  },

  keyboardContainer: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },

  contentCompact: {
    paddingTop: 14,
    paddingBottom: 8,
  },

  contentVeryCompact: {
    paddingTop: 10,
    paddingBottom: 6,
  },

  contentKeyboard: {
    paddingBottom: 20,
  },

  header: {
    height: 46,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: "#E9DFE9",
    justifyContent: "center",
    alignItems: "center",
  },

  backPressed: {
    backgroundColor: "#F4E7F0",
  },

  backArrow: {
    fontSize: 32,
    lineHeight: 37,
    marginTop: -3,
    color: C.plum,
  },

  progress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  progressFilled: {
    width: 34,
    height: 4,
    borderRadius: 5,
    backgroundColor: C.plum,
  },

  progressEmpty: {
    width: 34,
    height: 4,
    borderRadius: 5,
    backgroundColor: "#E7D7E6",
  },

  step: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: C.muted,
  },

  artwork: {
    height: 184,
    marginTop: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  artworkCompact: {
    height: 145,
    marginTop: 5,
  },

  artworkVeryCompact: {
    height: 115,
    marginTop: 2,
  },

  intro: {
    marginTop: 6,
  },

  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.65,
    color: C.rose,
  },

  title: {
    marginTop: 8,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 35,
    lineHeight: 44,
    letterSpacing: -0.9,
    color: C.dark,
    includeFontPadding: false,
  },

  titleAccent: {
    color: C.lavender,
  },

  description: {
    marginTop: 8,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: "#766D78",
  },

  numberRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 12,
    backgroundColor: "#F3E8F1",
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  numberDot: {
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: C.rose,
  },

  phoneNumber: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.plum,
  },

  editButton: {
    paddingHorizontal: 5,
    paddingVertical: 3,
  },

  editText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.lavender,
  },

  form: {
    marginTop: 22,
  },

  formCompact: {
    marginTop: 15,
  },

  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: C.ink,
    marginBottom: 11,
  },

  otpContainer: {
    height: 54,
    position: "relative",
  },

  otpRow: {
    height: 54,
    width: "100%",
    flexDirection: "row",
  },

  otpBox: {
    flex: 1,
    minWidth: 0,
    height: 54,
    borderRadius: 13,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: "#E8DDE8",
    alignItems: "center",
    justifyContent: "center",
  },

  otpBoxFilled: {
    borderColor: "#C7ACC9",
    backgroundColor: "#FFF9FF",
  },

  otpBoxActive: {
    borderColor: C.lavender,
  },

  otpDigit: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 22,
    color: C.plum,
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
    zIndex: 10,
  },

  securityNote: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  securityIcon: {
    fontSize: 15,
    color: C.rose,
  },

  securityText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    color: C.muted,
  },

  resendRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },

  resendLabel: {
    flexShrink: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: "#766D78",
  },

  resendAction: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.plum,
  },

  resendDisabled: {
    color: C.muted,
  },

  footer: {
    marginTop: 20,
    paddingBottom: 5,
  },

  footerCompact: {
    marginTop: 20,
  },

  footerKeyboard: {
    marginTop: 18,
  },

  verifyButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: C.plum,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
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
    marginTop: 14,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 1.35,
    color: C.lavender,
  },
});

export default styles;
