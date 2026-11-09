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

import NewPasswordBackground from "../components/new-password/NewPasswordBackground";

import styles from "../styles/createNewPassword.styles";

export default function CreateNewPasswordScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { feedback, validation, success: reportSuccess, error: reportError, clearFeedback } = useFeedback();
  const { recovery, busy, reset, clear } = useRecoveryFlow();
  const { height } = useWindowDimensions();
  const compact = height < 760;



  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Z]/.test(password) && /[a-z]/.test(password);
  const withinByteLimit = Array.from(password).reduce((bytes, char) => {
    const point = char.codePointAt(0);
    return bytes + (point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4);
  }, 0) <= 72;
  const hasNumber = /\d/.test(password);

  const passwordValid =
    hasMinLength && hasLetter && hasNumber && withinByteLimit;

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const canReset = passwordValid && passwordsMatch;

  const handleReset = async () => {
    clearFeedback();
    Keyboard.dismiss();
    if (!canReset) { validation("Use 8 or more characters, uppercase and lowercase letters, a number, and at most 72 UTF-8 bytes. Passwords must match."); return; }
    try {
      if (await reset(password, confirmPassword)) {
        setPassword(""); setConfirmPassword("");
        reportSuccess("Password Reset", "Your password has been reset. Sign in with your new password.");
        router.dismissAll(); router.replace("/(public)/login");
      }
    } catch (error) { reportError("Unable to Reset Password", recoveryErrorMessage(error)); }
  };
  const abandon = () => { clear(); router.replace("/(public)/forgot-password"); };
  if (!recovery.resetToken || Date.now() >= recovery.grantExpiresAt) return <RecoveryRequired />;

  return (
    <ScreenContainer padded={false}>
      <View style={styles.root}>
        {/* Approved minimal abstract background */}
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <NewPasswordBackground />
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
              <BackButton onPress={abandon} />

              <Text style={styles.headerLabel}>
                ACCOUNT RECOVERY
              </Text>
            </View>

            {/* Main */}
            <Animated.View
              style={[
                styles.main,
                {
                  opacity: fade,
                  transform: [{ translateY: rise }],
                },
              ]}
            >
              {!keyboardVisible && (
                <Text style={styles.stepLabel}>
                  STEP 03 / NEW PASSWORD
                </Text>
              )}

              <Text
                style={[
                  styles.title,
                  keyboardVisible && styles.titleKeyboard,
                ]}
              >
                A fresh{"\n"}
                <Text style={styles.titleAccent}>
                  beginning.
                </Text>
              </Text>

              {!keyboardVisible && (
                <Text style={styles.description}>
                  Your reset code is verified. Create a strong new password to secure
                  your Saheli Safar account.
                </Text>
              )}

              {/* Password Form */}
              <View
                style={[
                  styles.form,
                  compact && styles.formCompact,
                  keyboardVisible && styles.formKeyboard,
                ]}
              >
                <Text style={styles.fieldLabel}>
                  NEW PASSWORD
                </Text>

                <View
                  style={[
                    styles.inputWrap,
                    passwordFocused && styles.inputFocused,
                  ]}
                >
                  <TextInput keyboardAppearance="dark" selectionColor={colors.primary} underlineColorAndroid="transparent"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.textMuted}
                    autoComplete="new-password"
                    style={styles.input}
                    accessibilityLabel="New password"
                  />

                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.showButton}
                    accessibilityRole="button"
                    accessibilityLabel="Toggle new password visibility"
                  >
                    <Text style={styles.showText}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>

                {/* Password strength requirements */}
                {!keyboardVisible && (
                  <View style={styles.requirements}>
                    <View style={styles.requirement}>
                      <Text
                        style={[
                          styles.requirementIcon,
                          hasMinLength && styles.requirementMet,
                        ]}
                      >
                        {hasMinLength ? "✓" : "○"}
                      </Text>

                      <Text
                        style={[
                          styles.requirementText,
                          hasMinLength && styles.requirementTextMet,
                        ]}
                      >
                        8+ characters; maximum 72 UTF-8 bytes
                      </Text>
                    </View>

                    <View style={styles.requirement}>
                      <Text
                        style={[
                          styles.requirementIcon,
                          hasLetter && styles.requirementMet,
                        ]}
                      >
                        {hasLetter ? "✓" : "○"}
                      </Text>

                      <Text
                        style={[
                          styles.requirementText,
                          hasLetter && styles.requirementTextMet,
                        ]}
                      >
                        Uppercase and lowercase letters
                      </Text>
                    </View>

                    <View style={styles.requirement}>
                      <Text
                        style={[
                          styles.requirementIcon,
                          hasNumber && styles.requirementMet,
                        ]}
                      >
                        {hasNumber ? "✓" : "○"}
                      </Text>

                      <Text
                        style={[
                          styles.requirementText,
                          hasNumber && styles.requirementTextMet,
                        ]}
                      >
                        One number
                      </Text>
                    </View>
                  </View>
                )}

                <Text style={styles.confirmLabel}>
                  CONFIRM NEW PASSWORD
                </Text>

                <View
                  style={[
                    styles.inputWrap,
                    confirmFocused && styles.inputFocused,
                    confirmPassword.length > 0 &&
                      !passwordsMatch &&
                      !confirmFocused &&
                      styles.inputError,
                  ]}
                >
                  <TextInput keyboardAppearance="dark" selectionColor={colors.primary} underlineColorAndroid="transparent"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => setConfirmFocused(false)}
                    secureTextEntry={!showConfirm}
                    placeholder="Re-enter new password"
                    placeholderTextColor={colors.textMuted}
                    autoComplete="new-password"
                    style={styles.input}
                    accessibilityLabel="Confirm new password"
                  />

                  <Pressable
                    onPress={() => setShowConfirm((v) => !v)}
                    style={styles.showButton}
                    accessibilityRole="button"
                    accessibilityLabel="Toggle confirmation visibility"
                  >
                    <Text style={styles.showText}>
                      {showConfirm ? "Hide" : "Show"}
                    </Text>
                  </Pressable>
                </View>

                {confirmPassword.length > 0 && (
                  <Text
                    style={[
                      styles.matchMessage,
                      passwordsMatch
                        ? styles.matchSuccess
                        : styles.matchError,
                    ]}
                  >
                    {passwordsMatch
                      ? "✓ Passwords match"
                      : "Passwords do not match"}
                  </Text>
                )}
              </View>
            </Animated.View>

            {/* Footer */}
            <View style={styles.footer}>
              <InlineFeedback feedback={feedback} />
<Pressable
                onPress={handleReset}
                disabled={!canReset || busy}
                accessibilityState={{ busy }}
                accessibilityRole="button"
                accessibilityLabel="Reset password"
                style={({ pressed }) => [
                  styles.resetButton,
                  !canReset && styles.resetDisabled,
                  pressed && canReset && styles.resetPressed,
                ]}
              >
                <Text style={[styles.resetText, (!canReset || busy) && { color: colors.textMuted }]}>
                  {busy ? "Resetting..." : "Reset Password"}
                </Text>

                <View style={styles.arrowCircle}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </Pressable>

              {!keyboardVisible && (
                <Text style={styles.footerNote}>
                  A NEW PASSWORD. THE SAME SAFE JOURNEY.
                </Text>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
