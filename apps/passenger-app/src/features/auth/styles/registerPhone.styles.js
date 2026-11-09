import { colors } from "../../../theme/colors";

import { StyleSheet } from "react-native";
import { typography } from "../../../theme/typography";








const styles = StyleSheet.create({
  root: {
    flex: 1,
    position: "relative"
  },
  keyboardContainer: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 10
  },
  scrollCompact: {
    paddingBottom: 4
  },
  header: {
    height: 48,
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  progressContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center"
  },
  progressBar: {
    width: 29,
    height: 4,
    borderRadius: 6,
    backgroundColor: colors.border
  },
  progressActive: {
    width: 39,
    backgroundColor: colors.primary
  },
  stepText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textMuted
  },
  mainContent: {
    justifyContent: "center"
  },
  artwork: {
    height: 204,
    marginTop: 7,
    alignItems: "center",
    justifyContent: "center"
  },
  artworkCompact: {
    height: 155,
    marginTop: 0
  },
  artworkTiny: {
    height: 105
  },
  intro: {
    marginTop: 3
  },
  introCompact: {
    marginTop: 0
  },
  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 2.1,
    color: colors.accent
  },
  title: {
    marginTop: 7,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 37,
    lineHeight: 47,
    letterSpacing: -1,
    color: colors.textPrimary,
    includeFontPadding: false
  },
  titleCompact: {
    fontSize: 33,
    lineHeight: 42
  },
  titleAccent: {
    color: colors.primaryLight
  },
  subtitle: {
    marginTop: 7,
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
    marginTop: 17
  },
  fieldGroup: {
    gap: 13,
    marginBottom: 13
  },
  fieldLabel: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.5,
    color: colors.textSecondary,
    marginBottom: 10
  },
  inputCard: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 13
  },
  inputCardFocused: {
    borderColor: colors.focus,
    backgroundColor: colors.input
  },
  codeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingRight: 12
  },
  flag: {
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textSecondary
  },
  countryCode: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: colors.primary
  },
  separator: {
    height: 25,
    width: 1,
    backgroundColor: colors.divider
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    paddingLeft: 14,
    paddingRight: 4,
    fontFamily: typography.fontFamily.medium,
    fontSize: 16,
    letterSpacing: 0.4,
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
    marginTop: 11,
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
    marginTop: 32,
    paddingBottom: 5
  },
  continueButton: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.primary,
    paddingHorizontal: 18
  },
  disabledButton: {
    backgroundColor: colors.buttonDisabled
  },
  pressedButton: {
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
    color: colors.textOnPrimary,
    marginTop: -2
  },
  footerNote: {
    marginTop: 14,
    textAlign: "center",
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.primaryLight
  },
  terms: {
    marginTop: 7,
    textAlign: "center",
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 20,
    color: colors.textMuted
  }
});

export default styles;
