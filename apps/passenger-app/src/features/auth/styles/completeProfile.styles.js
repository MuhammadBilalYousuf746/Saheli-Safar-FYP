
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
  border: "#E8DDE8",
  error: "#C44555",
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

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 20,
  },

  scrollCompact: {
    paddingTop: 12,
    paddingBottom: 14,
  },

  header: {
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    fontSize: 32,
    lineHeight: 37,
    marginTop: -3,
    color: C.plum,
  },

  progress: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },

  progressFilled: {
    width: 34,
    height: 4,
    borderRadius: 6,
    backgroundColor: C.plum,
  },

  step: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: C.muted,
  },

  artwork: {
    height: 153,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  artworkCompact: {
    height: 117,
    marginTop: 5,
  },

  intro: {
    marginTop: 5,
  },

  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.7,
    color: C.rose,
  },

  title: {
    marginTop: 7,
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
    marginTop: 7,
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: "#766D78",
  },

  phoneBadge: {
    marginTop: 16,
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 15,
    backgroundColor: "#F3E8F1",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  phoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.rose,
  },

  phoneInfo: {
    flex: 1,
  },

  phoneCaption: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 1.1,
    color: C.muted,
  },

  phoneValue: {
    marginTop: 3,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: C.plum,
  },

  phoneLock: {
    fontSize: 20,
    color: C.lavender,
  },

  form: {
    marginTop: 20,
    gap: 13,
  },

  fieldBlock: {
    width: "100%",
  },

  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.3,
    marginBottom: 8,
    color: C.ink,
  },

  inputWrap: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 15,
  },

  inputFocused: {
    borderColor: C.lavender,
    backgroundColor: "#FFFCFF",
  },

  inputError: {
    borderColor: C.error,
  },

  input: {
    flex: 1,
    height: "100%",
    color: C.ink,
    fontFamily: typography.fontFamily.medium,
    fontSize: 14,
    paddingVertical: 0,
  },

  eyeButton: {
    paddingHorizontal: 6,
    paddingVertical: 9,
  },

  eyeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    color: C.lavender,
  },

  errorText: {
    marginTop: 5,
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
    color: C.error,
  },

  passwordHint: {
    marginTop: -6,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  hintDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.rose,
  },

  hintText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    lineHeight: 16,
    color: C.muted,
  },

  footer: {
    marginTop: 30,
    paddingBottom: 8,
  },

  createButton: {
    height: 56,
    borderRadius: 18,
    backgroundColor: C.plum,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  createButtonInactive: {
    backgroundColor: "#AA96A9",
  },

  createButtonPressed: {
    backgroundColor: C.dark,
    transform: [{ scale: 0.985 }],
  },

  createButtonText: {
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
    justifyContent: "center",
    alignItems: "center",
  },

  arrowText: {
    fontSize: 20,
    lineHeight: 23,
    marginTop: -2,
    color: C.white,
  },

  footerNote: {
    marginTop: 15,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 1.4,
    color: C.lavender,
  },
});

export default styles;
