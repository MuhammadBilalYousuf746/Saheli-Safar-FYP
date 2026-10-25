import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ScreenContainer from "../../../components/ScreenContainer";
import StepHeader from "../../../components/StepHeader";
import ScreenIntro from "../../../components/ScreenIntro";
import AppButton from "../../../components/AppButton";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { radius } from "../../../theme/spacing";
import { showAlert } from "../../../utils/alert";

import { resendDriverOTP, verifyDriverOTP } from "../services/driver-auth.api";
import { REGISTRATION_STEPS } from "./RegisterScreen";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

// STEP 2: Verify the code emailed to the driver.
export default function VerifyOTPScreen({ navigation, route }) {
  const { email = "", fullName = "", phoneNumber = "" } = route?.params || {};

  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [focused, setFocused] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (secondsLeft === 0) return;

    const timer = setTimeout(
      () => setSecondsLeft((current) => Math.max(0, current - 1)),
      1000
    );

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH || isVerifying) return;

    try {
      setIsVerifying(true);

      const response = await verifyDriverOTP(email, otp);

      navigation.navigate("Documents", {
        fullName: response.user?.fullName || fullName,
        email: response.user?.email || email,
        phoneNumber: response.user?.phone || phoneNumber,
        onboardingToken: response.onboardingToken,
      });
    } catch (error) {
      setOtp("");
      showAlert("Verification Failed", error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return;

    try {
      setIsResending(true);

      const response = await resendDriverOTP(email);

      setOtp("");
      setSecondsLeft(RESEND_SECONDS);

      showAlert(
        "New Code Sent",
        response.deliveryMode === "simulated"
          ? "Development mode: the code is printed in the backend terminal."
          : `We sent a new code to ${email}. Check your inbox and spam folder.`
      );
    } catch (error) {
      showAlert("Unable to Resend Code", error.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ScreenContainer
      footer={
        <AppButton
          title="Verify & continue"
          onPress={handleVerify}
          loading={isVerifying}
          disabled={otp.length !== OTP_LENGTH || isResending}
        />
      }
    >
      <StepHeader
        step={2}
        total={REGISTRATION_STEPS}
        onBack={() => navigation.goBack()}
      />

      <ScreenIntro
        eyebrow="STEP 2 · VERIFY EMAIL"
        title="Check your"
        accent="inbox."
        description="Enter the six-digit code we emailed you. It expires in 5 minutes."
      />

      <View style={styles.emailRow}>
        <Text style={styles.emailText} numberOfLines={1}>
          {email || "Your email address"}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Change email address"
        >
          <Text style={styles.changeText}>Change</Text>
        </Pressable>
      </View>

      {/* Six boxes drawn over one real (invisible) input. */}
      <Pressable
        style={styles.otpContainer}
        onPress={() => inputRef.current?.focus()}
      >
        <View pointerEvents="none" style={styles.otpRow}>
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const digit = otp[index] || "";
            const isActive = focused && otp.length === index;

            return (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  !!digit && styles.otpBoxFilled,
                  isActive && styles.otpBoxActive,
                ]}
              >
                <Text style={styles.otpDigit}>{digit}</Text>
              </View>
            );
          })}
        </View>

        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={(value) =>
            setOtp(value.replace(/\D/g, "").slice(0, OTP_LENGTH))
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === "ios" ? "one-time-code" : "off"}
          maxLength={OTP_LENGTH}
          caretHidden
          autoFocus
          style={styles.hiddenInput}
          accessibilityLabel="Six-digit verification code"
        />
      </Pressable>

      <View style={styles.resendRow}>
        <Text style={styles.resendLabel}>Didn't get it? Check spam, or</Text>
        <Pressable
          onPress={handleResend}
          disabled={secondsLeft > 0 || isResending}
          accessibilityRole="button"
          accessibilityLabel="Resend verification code"
        >
          <Text
            style={[
              styles.resendAction,
              secondsLeft > 0 && styles.resendDisabled,
            ]}
          >
            {secondsLeft > 0
              ? `resend in 0:${String(secondsLeft).padStart(2, "0")}`
              : "resend code"}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  emailText: {
    flex: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },

  changeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.primary,
  },

  otpContainer: {
    marginTop: 28,
    position: "relative",
  },

  otpRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },

  otpBox: {
    flex: 1,
    maxWidth: 54,
    aspectRatio: 0.82,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.input,
    alignItems: "center",
    justifyContent: "center",
  },

  otpBoxFilled: {
    borderColor: colors.textMuted,
    backgroundColor: colors.surfaceRaised,
  },

  otpBoxActive: {
    borderColor: colors.primary,
  },

  otpDigit: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 24,
    color: colors.textPrimary,
  },

  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.01,
    color: colors.transparent,
  },

  resendRow: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5,
  },

  resendLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },

  resendAction: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.primary,
  },

  resendDisabled: {
    color: colors.textMuted,
  },
});
