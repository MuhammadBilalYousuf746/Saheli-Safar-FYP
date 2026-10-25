
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
  View,
  useWindowDimensions,
} from "react-native";
import { showAlert } from "../../../utils/alert";

import ScreenContainer from "../../../components/ScreenContainer";

import ProfileBackground from "../components/profile/ProfileBackground";
import ProfileArtwork from "../components/profile/ProfileArtwork";
import FormField from "../components/profile/FormField";

import styles from "../styles/completeProfile.styles";

// Real backend API
import {
  completePassengerProfile,
} from "../services/passenger-auth.api";

export default function CompleteProfileScreen({ navigation, route }) {
  const { height } = useWindowDimensions();
  const compact = height < 760;

  // Name, email and phone were entered at registration
  // and verified with the email OTP.
  const fullName = route?.params?.fullName || "";
  const email = route?.params?.email || "";
  const phoneNumber = route?.params?.phoneNumber || "";
  const onboardingToken = route?.params?.onboardingToken || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Prevent duplicate account creation requests.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

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
        duration: 600,
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

  // Form validation
  const passwordError =
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/\d/.test(password)
      ? "Use 8+ characters, uppercase, lowercase and a number."
      : "";

  const confirmError =
    confirmPassword !== password
      ? "Passwords do not match."
      : "";

  const canSubmit =
    !passwordError &&
    !confirmError &&
    !!confirmPassword;

  // ==========================================
  // REAL BACKEND ACCOUNT CREATION
  // ==========================================
  const handleCreateAccount = async () => {
    if (submittingRef.current) return;

    setSubmitted(true);
    Keyboard.dismiss();

    if (!canSubmit) {
      showAlert(
        "Check Your Details",
        "Please create a valid password and confirm it."
      );
      return;
    }

    if (!onboardingToken) {
      showAlert(
        "Verification Required",
        "Please go back and verify your email address before creating your account."
      );
      return;
    }

    try {
      submittingRef.current = true;
      setIsSubmitting(true);

      // Submit profile to the actual backend.
      const response = await completePassengerProfile({
        password,
        confirmPassword,
        onboardingToken,
      });

      if (response.success) {
        // Clear passwords from component state.
        setPassword("");
        setConfirmPassword("");

        // Access token is not logged or stored insecurely.
        // Login integration will manage authenticated sessions.
        showAlert(
          "Account Created Successfully",
          "Welcome to Saheli Safar! Your account is now active. Please log in to continue.",
          [
            {
              text: "Continue to Login",
              onPress: () => {
                navigation.navigate("Login");
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        showAlert(
          "Account Creation Failed",
          response.message ||
            "Unable to create your account. Please try again."
        );
      }
    } catch (error) {
      showAlert(
        "Account Creation Failed",
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const eyeButton = (visible, onPress, label) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.eyeButton}
    >
      <Text style={styles.eyeText}>
        {visible ? "Hide" : "Show"}
      </Text>
    </Pressable>
  );

  return (
    <ScreenContainer padded={false}>
      <View style={styles.root}>
        {/* Decorative background */}
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <ProfileBackground />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              compact && styles.scrollCompact,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
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

              <View style={styles.progress}>
                <View style={styles.progressFilled} />
                <View style={styles.progressFilled} />
                <View style={styles.progressFilled} />
              </View>

              <Text style={styles.step}>03 / 03</Text>
            </View>

            {/* Profile illustration */}
            {!keyboardVisible && (
              <Animated.View
                style={[
                  styles.artwork,
                  compact && styles.artworkCompact,
                  {
                    opacity: fade,
                    transform: [{ translateY: rise }],
                  },
                ]}
              >
                <ProfileArtwork />
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
                THE FINAL LITTLE DETAIL
              </Text>

              <Text style={styles.title}>
                Make it{" "}
                <Text style={styles.titleAccent}>
                  yours.
                </Text>
              </Text>

              <Text style={styles.description}>
                Your email is verified. Create a password to secure
                your account.
              </Text>
            </Animated.View>

            {/* Verified registration details */}
            <View style={styles.phoneBadge}>
              <View style={styles.phoneDot} />

              <View style={styles.phoneInfo}>
                <Text style={styles.phoneCaption}>
                  {fullName ? fullName.toUpperCase() : "YOUR ACCOUNT"}
                </Text>

                <Text style={styles.phoneValue}>
                  {email || "Email not provided"}
                </Text>

                {!!phoneNumber && (
                  <Text style={styles.phoneValue}>
                    {phoneNumber}
                  </Text>
                )}
              </View>

              <Text style={styles.phoneLock}>✓</Text>
            </View>

            {/* Password form */}
            <View style={styles.form}>
              <FormField
                label="CREATE PASSWORD *"
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                secureTextEntry={!showPassword}
                rightAction={eyeButton(
                  showPassword,
                  () => setShowPassword((v) => !v),
                  "Toggle password visibility"
                )}
                error={submitted ? passwordError : ""}
              />

              <View style={styles.passwordHint}>
                <View style={styles.hintDot} />

                <Text style={styles.hintText}>
                  8+ characters, uppercase, lowercase and a number.
                </Text>
              </View>

              <FormField
                label="CONFIRM PASSWORD *"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                autoComplete="new-password"
                secureTextEntry={!showConfirm}
                rightAction={eyeButton(
                  showConfirm,
                  () => setShowConfirm((v) => !v),
                  "Toggle confirmation password visibility"
                )}
                error={submitted ? confirmError : ""}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Pressable
                onPress={handleCreateAccount}
                disabled={isSubmitting}
                style={({ pressed }) => [
                  styles.createButton,
                  !canSubmit && styles.createButtonInactive,
                  pressed && styles.createButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Create account"
                accessibilityState={{ busy: isSubmitting }}
              >
                <Text style={styles.createButtonText}>
                  Create My Account
                </Text>

                <View style={styles.arrowCircle}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </Pressable>

              <Text style={styles.footerNote}>
                EVERY JOURNEY BEGINS WITH YOU.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
