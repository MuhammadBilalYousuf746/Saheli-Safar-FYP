import BackButton from '../../../components/BackButton';
import { useReducedMotion } from '../../../theme/useReducedMotion';
import { colors } from "../../../theme/colors";
import { useRecoveryFlow, recoveryErrorMessage } from "../context/RecoveryFlowContext";
import RecoveryRequired from "../components/recovery/RecoveryRequired";
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

import ResetOTPBackground from "../components/reset-otp/ResetOTPBackground";

import styles from "../styles/verifyResetOTP.styles";

export default function VerifyResetOTPScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { feedback, error: reportError, inline, clearFeedback } = useFeedback();
  const { recovery, busy, verify, request, clear } = useRecoveryFlow();
  const { height } = useWindowDimensions();

  const compact = height < 760;



  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.ceil(((recovery.retryAt || 0) - Date.now()) / 1000)));
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const inputRef = useRef(null);

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(10)).current;

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
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => {
      setSecondsLeft(Math.max(0, Math.ceil(((recovery.retryAt || 0) - Date.now()) / 1000)));
    }, 1000);

    return () => clearTimeout(timer);
  }, [secondsLeft, recovery.retryAt]);

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

  const handleVerify = async () => {
    clearFeedback();
    Keyboard.dismiss();
    if (!canVerify) return;
    try {
      if (await verify(cleanOTP)) { setOtp(""); router.replace("/(public)/new-password"); }
    } catch (error) { reportError("Code Not Verified", recoveryErrorMessage(error)); }
  };
  const handleResend = async () => {
    clearFeedback();
    if (secondsLeft > 0 || busy) return;
    try {
      if (await request(recovery.email)) {
        setOtp(""); setSecondsLeft(60);
        inline("If this email belongs to an eligible Passenger, a new code will arrive shortly. Use only the newest code.");
      }
    } catch (error) { reportError("Unable to Resend Code", recoveryErrorMessage(error)); }
  };
  const changeEmail = () => { clear(); router.replace("/(public)/forgot-password"); };
  if (!recovery.email) return <RecoveryRequired />;

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
          {/* Content scrolls when the keyboard or a small screen limits height. */}
          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              compact && styles.contentCompact,
              keyboardVisible && styles.contentKeyboard,
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <BackButton onPress={changeEmail} />

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
                  email.
                </Text>
              </Text>

              {!keyboardVisible && (
                <Text style={styles.description}>
                  {recovery.message || "If your Passenger account is eligible, check your email for the six-digit reset code."}
                </Text>
              )}

              <View style={styles.phoneRow}>
                <Text style={styles.phoneNumber}>
                  {recovery.email}
                </Text>

                <Pressable
                  onPress={changeEmail}
                  accessibilityRole="button"
                  accessibilityLabel="Change email address"
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
                  <TextInput keyboardAppearance="dark" selectionColor={colors.primary} placeholderTextColor={colors.textMuted} underlineColorAndroid="transparent"
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
              <InlineFeedback feedback={feedback} />
<Pressable
                onPress={handleVerify}
                disabled={!canVerify || busy}
                accessibilityState={{ busy }}
                accessibilityRole="button"
                accessibilityLabel="Verify code"
                style={({ pressed }) => [
                  styles.verifyButton,
                  !canVerify && styles.verifyDisabled,
                  pressed && canVerify && styles.verifyPressed,
                ]}
              >
                <Text style={[styles.verifyText, (!canVerify || busy) && { color: colors.textMuted }]}>
                  {busy ? "Checking..." : "Verify Code"}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
