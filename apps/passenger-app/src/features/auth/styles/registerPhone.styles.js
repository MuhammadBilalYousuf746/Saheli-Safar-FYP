
import { StyleSheet } from "react-native";
import { typography } from "../../../theme/typography";

const PLUM = "#552D50";
const DEEP = "#382039";
const LAVENDER = "#9473AE";
const ROSE = "#C98291";
const INK = "#392C3C";
const MUTED = "#827982";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative",
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 10,
  },

  scrollCompact: {
    paddingBottom: 4,
  },

  header: {
    height: 46,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E9DFE9",
    alignItems: "center",
    justifyContent: "center",
  },

  backPressed: {
    backgroundColor: "#F4E7F0",
  },

  backArrow: {
    fontSize: 32,
    lineHeight: 37,
    color: PLUM,
    marginTop: -3,
  },

  progressContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },

  progressBar: {
    width: 29,
    height: 4,
    borderRadius: 6,
    backgroundColor: "#E7D7E6",
  },

  progressActive: {
    width: 39,
    backgroundColor: PLUM,
  },

  stepText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: MUTED,
  },

  mainContent: {
    justifyContent: "center",
  },

  artwork: {
    height: 204,
    marginTop: 7,
    alignItems: "center",
    justifyContent: "center",
  },

  artworkCompact: {
    height: 155,
    marginTop: 0,
  },

  artworkTiny: {
    height: 105,
  },

  intro: {
    marginTop: 3,
  },

  introCompact: {
    marginTop: 0,
  },

  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 2.1,
    color: ROSE,
  },

  title: {
    marginTop: 7,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 37,
    lineHeight: 47,
    letterSpacing: -1,
    color: DEEP,
    includeFontPadding: false,
  },

  titleCompact: {
    fontSize: 33,
    lineHeight: 42,
  },

  titleAccent: {
    color: LAVENDER,
  },

  subtitle: {
    marginTop: 7,
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
    marginTop: 17,
  },

  fieldGroup: {
    gap: 13,
    marginBottom: 13,
  },

  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: INK,
    marginBottom: 10,
  },

  inputCard: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E8DDE8",
    borderRadius: 18,
    paddingHorizontal: 13,
  },

  inputCardFocused: {
    borderColor: LAVENDER,
    backgroundColor: "#FFFCFF",
  },

  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingRight: 12,
  },

  flag: {
    fontSize: 19,
  },

  countryCode: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: PLUM,
  },

  separator: {
    height: 25,
    width: 1,
    backgroundColor: "#E8DCE6",
  },

  phoneInput: {
    flex: 1,
    height: "100%",
    paddingLeft: 14,
    paddingRight: 4,
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    letterSpacing: 0.4,
    color: INK,
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
    color: "#27836B",
  },

  helperRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  helperDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ROSE,
  },

  helperText: {
    flex: 1,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 17,
    color: MUTED,
  },

  footer: {
    marginTop: 32,
    paddingBottom: 5,
  },

  continueButton: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: PLUM,
    paddingHorizontal: 18,
  },

  disabledButton: {
    backgroundColor: "#AA96A9",
  },

  pressedButton: {
    backgroundColor: DEEP,
    transform: [{ scale: 0.985 }],
  },

  continueText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: "#FFFFFF",
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
    color: "#FFFFFF",
    marginTop: -2,
  },

  footerNote: {
    marginTop: 14,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 1.7,
    color: LAVENDER,
  },

  terms: {
    marginTop: 7,
    textAlign: "center",
    fontFamily: typography.fontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
    color: MUTED,
  },
});

export default styles;
