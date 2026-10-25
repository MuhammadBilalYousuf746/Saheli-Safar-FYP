
import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { showAlert } from "../../../utils/alert";

import ScreenContainer from "../../../components/ScreenContainer";

import ResetOTPBackground from "../components/reset-otp/ResetOTPBackground";

import styles from "../styles/verifyResetOTP.styles";

export default function VerifyResetOTPScreen({
  navigation,
  route,
}) {
  const { height } = useWindowDimensions();

  const compact = height < 760;

  const phoneNumber = route?.params?.phoneNumber || "";

  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef(null);

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [fade, rise]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft]);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios"
        ? "keyboardWillShow"
        : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );

    const hide = Keyboard.addListener(
      Platform.OS === "ios"
        ? "keyboardWillHide"
        : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const cleanOTP = otp.replace(/\D/g, "").slice(0, 6);
  const canVerify = cleanOTP.length === 6;

  const displayPhone =
    typeof phoneNumber === "string" && /^3\d{9}$/.test(phoneNumber)
      ? `+92 ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`
      : "your registered mobile number";

  const handleVerify = () => {
    Keyboard.dismiss();

    if (!canVerify) {
      showAlert(
        "Incomplete Code",
        "Please enter the complete 6-digit code."
      );
      return;
    }

    showAlert(
      "Verification Preview",
      "OTP verification will be available after connecting the authentication backend."
    );
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;

    Keyboard.dismiss();

    showAlert(
      "SMS Not Connected",
      "A new verification code cannot be sent until the backend is connected."
    );
  };

  return (
    <ScreenContainer padded={false}>
      <View style={styles.root}>
        {/* Approved minimal abstract background */}
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <ResetOTPBackground />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Fixed layout — no scrolling */}
          <View
            style={[
              styles.content,
              compact && styles.contentCompact,
              keyboardVisible && styles.contentKeyboard,
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back"
              >
                <Text style={styles.backArrow}>‹</Text>
              </Pressable>

              <Text style={styles.headerLabel}>
                ACCOUNT RECOVERY
              </Text>
            </View>

            {/* Main content */}
            <Animated.View
              style={[
                styles.main,
                {
                  opacity: fade,
                  transform: [{ translateY: rise }],
                },
              ]}
            >
              <Text style={styles.stepLabel}>
                STEP 02 / VERIFICATION
              </Text>

              <Text
                style={[
                  styles.title,
                  keyboardVisible && styles.titleKeyboard,
                ]}
              >
                Verify your{"\n"}
                <Text style={styles.titleAccent}>
                  number.
                </Text>
              </Text>

              {!keyboardVisible && (
                <Text style={styles.description}>
                  Enter the 6-digit code sent to your
                  registered mobile number.
                </Text>
              )}

              <View style={styles.phoneRow}>
                <Text style={styles.phoneNumber}>
                  {displayPhone}
                </Text>

                <Pressable
                  onPress={() => navigation.goBack()}
                  accessibilityRole="button"
                  accessibilityLabel="Change mobile number"
                  hitSlop={8}
                >
                  <Text style={styles.changeText}>
                    Change
                  </Text>
                </Pressable>
              </View>

              {/* OTP input */}
              <View
                style={[
                  styles.form,
                  compact && styles.formCompact,
                  keyboardVisible && styles.formKeyboard,
                ]}
              >
                <Text style={styles.fieldLabel}>
                  VERIFICATION CODE
                </Text>

                <View style={styles.otpContainer}>
                  {Array.from({ length: 6 }).map((_, index) => {
                    const digit = cleanOTP[index] || "";
                    const active =
                      focused &&
                      index === Math.min(cleanOTP.length, 5);

                    return (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          digit && styles.otpBoxFilled,
                          active && styles.otpBoxActive,
                        ]}
                      >
                        <Text style={styles.otpDigit}>
                          {digit}
                        </Text>

                        {active && !digit && (
                          <View style={styles.cursor} />
                        )}
                      </View>
                    );
                  })}

                  {/* Real input across all six boxes */}
                  <TextInput
                    ref={inputRef}
                    value={cleanOTP}
                    onChangeText={(value) =>
                      setOtp(
                        value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    maxLength={6}
                    style={styles.hiddenInput}
                    caretHidden
                    accessibilityLabel="Six digit verification code"
                  />
                </View>

                <View style={styles.resendRow}>
                  <Text style={styles.resendPrompt}>
                    Didn't receive it?
                  </Text>

                  {secondsLeft > 0 ? (
                    <Text style={styles.resendCountdown}>
                      Resend in {secondsLeft}s
                    </Text>
                  ) : (
                    <Pressable
                      onPress={handleResend}
                      accessibilityRole="button"
                      accessibilityLabel="Resend verification code"
                    >
                      <Text style={styles.resendLink}>
                        Resend code
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </Animated.View>

            {/* Footer — approved raised position */}
            <View
              style={[
                styles.footer,
                keyboardVisible && styles.footerKeyboard,
              ]}
            >
              <Pressable
                onPress={handleVerify}
                disabled={!canVerify}
                accessibilityRole="button"
                accessibilityLabel="Verify code"
                style={({ pressed }) => [
                  styles.verifyButton,
                  !canVerify && styles.verifyDisabled,
                  pressed && canVerify && styles.verifyPressed,
                ]}
              >
                <Text style={styles.verifyText}>
                  Verify Code
                </Text>

                <View style={styles.arrowCircle}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </Pressable>

              {!keyboardVisible && (
                <Text style={styles.footerNote}>
                  SAHELI SAFAR · SECURE ACCOUNT RECOVERY
                </Text>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
