
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
    paddingBottom: 18,
    justifyContent: "space-between",
  },

  contentCompact: {
    paddingTop: 10,
    paddingBottom: 10,
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

  backPressed: {
    backgroundColor: "#F4E7F0",
  },

  backArrow: {
    fontSize: 32,
    lineHeight: 37,
    marginTop: -3,
    color: C.plum,
  },

  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  brandLine: {
    height: 2,
    width: 21,
    backgroundColor: C.rose,
    borderRadius: 2,
  },

  brandText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: C.plum,
  },

  middle: {
    flexShrink: 1,
    justifyContent: "center",
  },

  middleKeyboard: {
    justifyContent: "center",
  },

  artwork: {
    height: 204,
    marginTop: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  artworkCompact: {
    height: 160,
    marginTop: 0,
  },

  artworkTiny: {
    height: 110,
  },

  intro: {
    marginTop: 8,
  },

  introKeyboard: {
    marginTop: 0,
  },

  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: C.rose,
  },

  title: {
    marginTop: 7,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 37,
    lineHeight: 46,
    letterSpacing: -0.9,
    color: C.dark,
    includeFontPadding: false,
  },

  titleKeyboard: {
    fontSize: 28,
    lineHeight: 36,
    marginTop: 0,
  },

  titleAccent: {
    color: C.lavender,
  },

  description: {
    marginTop: 8,
    maxWidth: 315,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    color: "#766D78",
  },

  form: {
    marginTop: 24,
  },

  formCompact: {
    marginTop: 14,
  },

  formKeyboard: {
    marginTop: 10,
  },

  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: C.ink,
    marginBottom: 9,
  },

  inputWrap: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 17,
    paddingHorizontal: 14,
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
    height: 25,
    width: 1,
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

  passwordHeader: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  forgotText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.lavender,
    marginBottom: 9,
  },

  eyeButton: {
    paddingHorizontal: 6,
    paddingVertical: 10,
  },

  eyeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.lavender,
  },

  footer: {
    paddingBottom: 3,
  },

  footerKeyboard: {
    paddingBottom: 0,
  },

  loginButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: C.plum,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  loginDisabled: {
    backgroundColor: "#AA96A9",
  },

  loginPressed: {
    backgroundColor: C.dark,
    transform: [{ scale: 0.985 }],
  },

  loginText: {
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

  registerRow: {
    marginTop: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "wrap",
  },

  registerPrompt: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: C.muted,
  },

  registerLink: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.plum,
  },

  footerNote: {
    marginTop: 21,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 1.5,
    color: C.lavender,
  },
});

export default styles;
