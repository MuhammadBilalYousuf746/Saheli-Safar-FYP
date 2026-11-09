import BackButton from '../../../components/BackButton';
import { backOrReplace } from '../../../navigation/passenger-navigation';
import { useReducedMotion } from '../../../theme/useReducedMotion';
import { colors } from "../../../theme/colors";
import { useRegistrationFlow } from "../context/RegistrationFlowContext";
import { useRouter } from "expo-router";

import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useFeedback, InlineFeedback } from "../../../notifications/useFeedback";

import ScreenContainer from "../../../components/ScreenContainer";

import OTPBackground from "../components/otp/OTPBackground";
import OTPArtwork from "../components/otp/OTPArtwork";
import styles from "../styles/verifyOTP.styles";

// Backend Authentication APIs
import {
  verifyPassengerOTP,
  resendPassengerOTP,
} from "../services/passenger-auth.api";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyOTPScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { feedback, validation, error: reportError, inline, clearFeedback } = useFeedback();
  const { registration, setRegistration } = useRegistrationFlow();
  const { height, width } = useWindowDimensions();

  const compact = height < 790;
  const veryCompact = height < 700;
  const tiny = height < 620;

  // The OTP is sent to the email entered at registration.
  const email = registration.email || "";
  const fullName = registration.fullName || "";
  const phoneNumber = registration.phoneNumber || "";

  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Backend request states
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const requestInProgress = useRef(false);

  const inputRef = useRef(null);
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: reducedMotion ? 0 : 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: reducedMotion ? 0 : 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [fade, rise, reducedMotion]);

  useEffect(() => {
    const show = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );

    const hide = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const handleOtpChange = (value) => {
    setOtp(value.replace(/\D/g, "").slice(0, OTP_LENGTH));
  };

  // ==========================================
  // VERIFY OTP WITH BACKEND
  // ==========================================
  const handleVerify = async () => {
    clearFeedback();
    if (requestInProgress.current) return;

    if (otp.length !== OTP_LENGTH) {
      validation("Please enter the complete six-digit code.");
      return;
    }

    if (!email) {
      reportError("Email Missing", "Please return to registration and enter your email address.");
      return;
    }

    Keyboard.dismiss();

    try {
      requestInProgress.current = true;
      setIsVerifying(true);

      const response = await verifyPassengerOTP(email, otp);

      if (response.success && response.onboardingToken) {
        // Only navigate after real backend verification.
        // The onboarding token is needed to complete registration.
        setRegistration({
          email: response.user?.email || email,
          fullName: response.user?.fullName || fullName,
          phoneNumber: response.user?.phone || phoneNumber,
          onboardingToken: response.onboardingToken,
        });

        router.navigate("/(public)/password-setup");
      } else {
        reportError("Verification Failed", "Unable to verify your code. Please try again.");
      }
    } catch (error) {
      reportError("Verification Failed", error.message ||
          "Invalid or expired verification code. Please try again.");
    } finally {
      requestInProgress.current = false;
      setIsVerifying(false);
    }
  };

  // ==========================================
  // RESEND OTP USING BACKEND
  // ==========================================
  const handleResend = async () => {
    clearFeedback();
    if (secondsLeft > 0 || requestInProgress.current) {
      return;
    }

    if (!email) {
      reportError("Email Missing", "Please return to registration and enter your email address.");
      return;
    }

    try {
      requestInProgress.current = true;
      setIsResending(true);

      const response = await resendPassengerOTP(email);

      if (response.success) {
        // Clear previously entered OTP.
        setRegistration(current => ({ ...current,
          deliveryMode: response.deliveryMode === "simulated" ? "simulated" : undefined,
        }));
        setOtp("");

        // Restart cooldown after successful resend.
        setSecondsLeft(RESEND_SECONDS);

        inline(response.deliveryMode === "simulated"
            ? "A new verification code was generated. Check the development backend terminal."
            : `A new verification code has been sent to ${email}. Check your inbox and spam folder.`);
      }
    } catch (error) {
      reportError("Unable to Resend Code", error.message ||
          "Unable to resend verification code. Please try again.");
    } finally {
      requestInProgress.current = false;
      setIsResending(false);
    }
  };

  const isComplete = otp.length === OTP_LENGTH;
  const showArtwork = !keyboardVisible && !tiny;

  const formatTime = (seconds) =>
    `00:${String(seconds).padStart(2, "0")}`;

  return (
    <ScreenContainer padded={false}>
      <View style={styles.root}>
        {/* Abstract background */}
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <OTPBackground />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              compact && styles.contentCompact,
              veryCompact && styles.contentVeryCompact,
              keyboardVisible && styles.contentKeyboard,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <BackButton onPress={() => backOrReplace(router, '/(public)/register')} />

              <View style={styles.progress}>
                <View style={styles.progressFilled} />
                <View style={styles.progressFilled} />
                <View style={styles.progressEmpty} />
              </View>

              <Text style={styles.step}>02 / 03</Text>
            </View>

            {/* Illustration */}
            {showArtwork && (
              <Animated.View
                style={[
                  styles.artwork,
                  compact && styles.artworkCompact,
                  veryCompact && styles.artworkVeryCompact,
                  {
                    opacity: fade,
                    transform: [{ translateY: rise }],
                  },
                ]}
              >
                <OTPArtwork />
              </Animated.View>
            )}

            {/* Heading */}
            <Animated.View
              style={[
                styles.intro,
                {
                  opacity: fade,
                  transform: [{ translateY: rise }],
                },
              ]}
            >
              <Text style={styles.eyebrow}>
                PRIVATE. PERSONAL. PROTECTED.
              </Text>

              <Text style={styles.title}>
                Just one more{" "}
                <Text style={styles.titleAccent}>
                  Step.
                </Text>
              </Text>

              <Text style={styles.description}>
                {registration.deliveryMode === "simulated"
                  ? "A six-digit code was generated for development testing. Check the development backend terminal and enter it here. No email was sent."
                  : "Enter the six-digit code sent to your email. Check your inbox and spam folder."}
              </Text>

              <View style={styles.numberRow}>
                <View style={styles.numberDot} />

                <Text style={styles.phoneNumber}>
                  {email || "Your email address"}
                </Text>

                <Pressable
                  onPress={() => backOrReplace(router, '/(public)/register')}
                  style={styles.editButton}
                  accessibilityRole="button"
                  accessibilityLabel="Change email address"
                >
                  <Text style={styles.editText}>Edit ↗</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* OTP Form */}
            <View
              style={[
                styles.form,
                compact && styles.formCompact,
              ]}
            >
              <Text style={styles.fieldLabel}>
                ENTER VERIFICATION CODE
              </Text>

              <View style={styles.otpContainer}>
                <View
                  pointerEvents="none"
                  style={[
                    styles.otpRow,
                    { gap: width < 360 ? 6 : 9 },
                  ]}
                >
                  {Array.from({ length: OTP_LENGTH }).map(
                    (_, index) => {
                      const digit = otp[index] || "";

                      const isActive =
                        inputFocused &&
                        otp.length === index;

                      return (
                        <View
                          key={index}
                          style={[
                            styles.otpBox,
                            digit && styles.otpBoxFilled,
                            isActive && styles.otpBoxActive,
                          ]}
                        >
                          <Text style={styles.otpDigit}>
                            {digit}
                          </Text>
                        </View>
                      );
                    }
                  )}
                </View>

                {/* Real input over decorative OTP boxes */}
                <TextInput keyboardAppearance="dark" placeholderTextColor={colors.textMuted} underlineColorAndroid="transparent"
                  ref={inputRef}
                  value={otp}
                  onChangeText={handleOtpChange}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete={
                    Platform.OS === "ios" ? "one-time-code" : "off"
                  }
                  maxLength={6}
                  caretHidden
                  selectionColor={colors.primary}
                  style={styles.hiddenInput}
                  accessibilityLabel="Six-digit verification code"
                />
              </View>

              <View style={styles.securityNote}>
                <Text style={styles.securityIcon}>✦</Text>
                <Text style={styles.securityText}>
                  Never share your verification code.
                </Text>
              </View>

              <View style={styles.resendRow}>
                <Text style={styles.resendLabel}>
                  Didn't get the code?
                </Text>

                <Pressable
                  onPress={handleResend}
                  disabled={
                    secondsLeft > 0 ||
                    isVerifying ||
                    isResending
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Resend verification code"
                  accessibilityState={{ busy: isResending }}
                >
                  <Text
                    style={[
                      styles.resendAction,
                      secondsLeft > 0 && styles.resendDisabled,
                    ]}
                  >
                    {secondsLeft > 0
                      ? `Resend ${formatTime(secondsLeft)}`
                      : "Resend code"}
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Footer */}
            <View
              style={[
                styles.footer,
                compact && styles.footerCompact,
                keyboardVisible && styles.footerKeyboard,
              ]}
            >
              <InlineFeedback feedback={feedback} />
<Pressable
                onPress={handleVerify}
                disabled={
                  !isComplete ||
                  isVerifying ||
                  isResending
                }
                accessibilityRole="button"
                accessibilityLabel="Verify and continue"
                accessibilityState={{ busy: isVerifying }}
                style={({ pressed }) => [
                  styles.verifyButton,
                  !isComplete && styles.verifyDisabled,
                  pressed &&
                    isComplete &&
                    !isVerifying &&
                    !isResending &&
                    styles.verifyPressed,
                ]}
              >
                <Text style={[styles.verifyText, (!isComplete || isVerifying || isResending) && { color: colors.textMuted }]}>
                  Verify & Continue
                </Text>

                <View style={styles.arrowCircle}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </Pressable>

              {!keyboardVisible && (
                <Text style={styles.footerNote}>
                  A LITTLE VERIFICATION. A LOT OF PEACE.
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
