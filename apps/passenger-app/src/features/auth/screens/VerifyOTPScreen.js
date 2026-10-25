
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
import { showAlert } from "../../../utils/alert";

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

export default function VerifyOTPScreen({ navigation, route }) {
  const { height, width } = useWindowDimensions();

  const compact = height < 790;
  const veryCompact = height < 700;
  const tiny = height < 620;

  // The OTP is sent to the email entered at registration.
  const email = route?.params?.email || "";
  const fullName = route?.params?.fullName || "";
  const phoneNumber = route?.params?.phoneNumber || "";

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
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [fade, rise]);

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
    if (requestInProgress.current) return;

    if (otp.length !== OTP_LENGTH) {
      showAlert(
        "Incomplete Code",
        "Please enter the complete six-digit code."
      );
      return;
    }

    if (!email) {
      showAlert(
        "Email Missing",
        "Please return to registration and enter your email address."
      );
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
        navigation.navigate("CompleteProfile", {
          email: response.user?.email || email,
          fullName: response.user?.fullName || fullName,
          phoneNumber: response.user?.phone || phoneNumber,
          onboardingToken: response.onboardingToken,
        });
      } else {
        showAlert(
          "Verification Failed",
          "Unable to verify your code. Please try again."
        );
      }
    } catch (error) {
      showAlert(
        "Verification Failed",
        error.message ||
          "Invalid or expired verification code. Please try again."
      );
    } finally {
      requestInProgress.current = false;
      setIsVerifying(false);
    }
  };

  // ==========================================
  // RESEND OTP USING BACKEND
  // ==========================================
  const handleResend = async () => {
    if (secondsLeft > 0 || requestInProgress.current) {
      return;
    }

    if (!email) {
      showAlert(
        "Email Missing",
        "Please return to registration and enter your email address."
      );
      return;
    }

    try {
      requestInProgress.current = true;
      setIsResending(true);

      const response = await resendPassengerOTP(email);

      if (response.success) {
        // Clear previously entered OTP.
        setOtp("");

        // Restart cooldown after successful resend.
        setSecondsLeft(RESEND_SECONDS);

        showAlert(
          "New Code Generated",
          response.deliveryMode === "simulated"
            ? "A new verification code was generated. Check the development backend terminal."
            : `A new verification code has been sent to ${email}. Check your inbox and spam folder.`
        );
      }
    } catch (error) {
      showAlert(
        "Unable to Resend Code",
        error.message ||
          "Unable to resend verification code. Please try again."
      );
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
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backArrow}>‹</Text>
              </Pressable>

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
                We emailed a six-digit code to you. Check your inbox
                (and spam folder) and enter it here.
              </Text>

              <View style={styles.numberRow}>
                <View style={styles.numberDot} />

                <Text style={styles.phoneNumber}>
                  {email || "Your email address"}
                </Text>

                <Pressable
                  onPress={() => navigation.goBack()}
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
                <TextInput
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
                  selectionColor="#552D50"
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
                <Text style={styles.verifyText}>
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
