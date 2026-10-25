
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
    letterSpacing: 1.6,
    color: C.plum,
  },

  main: {
    flexShrink: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  symbolWrap: {
    width: 94,
    height: 94,
    marginBottom: 28,
  },

  symbolCompact: {
    width: 72,
    height: 72,
    marginBottom: 17,
  },

  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: C.rose,
  },

  title: {
    marginTop: 13,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 39,
    lineHeight: 48,
    letterSpacing: -1,
    color: C.dark,
    includeFontPadding: false,
  },

  titleKeyboard: {
    fontSize: 29,
    lineHeight: 38,
    marginTop: 0,
  },

  titleAccent: {
    color: C.lavender,
  },

  description: {
    marginTop: 15,
    maxWidth: 310,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 21,
    color: "#766D78",
  },

  form: {
    marginTop: 42,
    width: "100%",
  },

  formCompact: {
    marginTop: 25,
  },

  formKeyboard: {
    marginTop: 20,
  },

  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: C.ink,
    marginBottom: 11,
  },

  inputWrap: {
    height: 58,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  inputFocused: {
    borderColor: C.lavender,
    backgroundColor: "#FFFCFF",
  },

  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingRight: 12,
  },

  flag: {
    fontSize: 18,
  },

  codeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: C.plum,
  },

  separator: {
    width: 1,
    height: 25,
    backgroundColor: "#E8DCE6",
    marginRight: 12,
  },

  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontFamily: typography.fontFamily.medium,
    fontSize: 15,
    color: C.ink,
  },

  validCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E4F4EC",
    alignItems: "center",
    justifyContent: "center",
  },

  validCheck: {
    fontSize: 13,
    fontWeight: "700",
    color: C.success,
  },

  helperRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  helperDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.rose,
  },

  helperText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 17,
    color: C.muted,
  },

  footer: {
    paddingBottom: 3,
  },

  continueButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: C.plum,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  continueDisabled: {
    backgroundColor: "#AA96A9",
  },

  continuePressed: {
    backgroundColor: C.dark,
    transform: [{ scale: 0.985 }],
  },

  continueText: {
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

  backToLogin: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  backToLoginText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.plum,
  },

  footerNote: {
    marginTop: 28,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 1.35,
    color: C.lavender,
  },
});

export default styles;
