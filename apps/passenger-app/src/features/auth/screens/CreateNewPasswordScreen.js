
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

import NewPasswordBackground from "../components/new-password/NewPasswordBackground";

import styles from "../styles/createNewPassword.styles";

export default function CreateNewPasswordScreen({
  navigation,
  route,
}) {
  const { height } = useWindowDimensions();
  const compact = height < 760;

  // Reserved for backend integration after OTP verification.
  const phoneNumber = route?.params?.phoneNumber || "";

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
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 580,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [fade, rise]);

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
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);

  const passwordValid =
    hasMinLength && hasLetter && hasNumber;

  const passwordsMatch =
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const canReset = passwordValid && passwordsMatch;

  const handleReset = () => {
    Keyboard.dismiss();

    if (!canReset) {
      showAlert(
        "Check Your Password",
        "Please meet all password requirements and ensure both passwords match."
      );
      return;
    }

    // Actual password reset requires a backend-verified
    // recovery token. Never reset using only a phone number.
    showAlert(
      "Password Reset Preview",
      "Your password meets the requirements. The actual reset will be enabled after secure OTP verification and backend integration."
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
          <NewPasswordBackground />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Fixed layout — no ScrollView */}
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
                  Create a strong new password to secure
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
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#B4A7B3"
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
                        At least 8 characters
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
                        One letter
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
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setConfirmFocused(true)}
                    onBlur={() => setConfirmFocused(false)}
                    secureTextEntry={!showConfirm}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#B4A7B3"
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
              <Pressable
                onPress={handleReset}
                disabled={!canReset}
                accessibilityRole="button"
                accessibilityLabel="Reset password"
                style={({ pressed }) => [
                  styles.resetButton,
                  !canReset && styles.resetDisabled,
                  pressed && canReset && styles.resetPressed,
                ]}
              >
                <Text style={styles.resetText}>
                  Reset Password
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
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
