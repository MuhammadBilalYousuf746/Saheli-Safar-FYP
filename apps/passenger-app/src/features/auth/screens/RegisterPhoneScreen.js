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

import RegistrationBackground from "../components/register/RegistrationBackground";
import RegistrationArtwork from "../components/register/RegistrationArtwork";
import FormField from "../components/profile/FormField";

import styles from "../styles/registerPhone.styles";

// Backend Registration API
import { registerPassenger } from "../services/passenger-auth.api";

export default function RegisterPhoneScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { feedback, validation, error: reportError, clearFeedback } = useFeedback();
  const { setRegistration } = useRegistrationFlow();
  const { height } = useWindowDimensions();

  const compact = height < 760;
  const veryCompact = height < 680;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Prevent duplicate registration requests.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(14)).current;

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

  const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);
  const isValidPhone = /^3\d{9}$/.test(cleanPhone);

  const cleanName = fullName.trim();
  const cleanEmail = email.trim().toLowerCase();

  // Name, email and phone are all required.
  const nameError =
    cleanName.length < 2 ? "Please enter your full name." : "";

  const emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ? "Please enter a valid email address."
    : "";

  const canContinue = !nameError && !emailError && isValidPhone;

  // Register passenger using the real backend API.
  const handleContinue = async () => {
    clearFeedback();
    if (isSubmitting) return;

    setSubmitted(true);

    if (!canContinue) {
      validation("Please enter your full name, a valid email address and a valid Pakistani mobile number.");
      return;
    }

    const phoneNumber = `+92${cleanPhone}`;

    try {
      setIsSubmitting(true);

      // Backend emails the verification code.
      const response = await registerPassenger({
        fullName: cleanName,
        email: cleanEmail,
        phone: phoneNumber,
      });

      // Navigate only after successful API response.
      if (response.success) {
        setRegistration({
          email: cleanEmail,
          fullName: cleanName,
          phoneNumber,
          deliveryMode: response.deliveryMode === "simulated" ? "simulated" : undefined,
        });

        router.navigate("/(public)/verify-otp");
      }
    } catch (error) {
      reportError("Registration Failed", error.message ||
          "Unable to process your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      <View style={styles.root}>
        {/* Full-width decorative background */}
        <View
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        >
          <RegistrationBackground />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
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
              <BackButton onPress={() => backOrReplace(router, '/(public)/welcome')} />

              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    styles.progressActive,
                  ]}
                />
                <View style={styles.progressBar} />
                <View style={styles.progressBar} />
              </View>

              <Text style={styles.stepText}>01 / 03</Text>
            </View>

            <View style={styles.mainContent}>
              {/* Illustration */}
              <Animated.View
                style={[
                  styles.artwork,
                  styles.artworkCompact,
                  veryCompact && styles.artworkTiny,
                  {
                    opacity: fade,
                    transform: [{ translateY: rise }],
                  },
                ]}
              >
                <RegistrationArtwork />
              </Animated.View>

              {/* Heading */}
              <Animated.View
                style={[
                  styles.intro,
                  compact && styles.introCompact,
                  {
                    opacity: fade,
                    transform: [{ translateY: rise }],
                  },
                ]}
              >
                <Text style={styles.eyebrow}>
                  A SAFER WAY TO MOVE
                </Text>

                <Text
                  style={[
                    styles.title,
                    veryCompact && styles.titleCompact,
                  ]}
                >
                  Hello,{" "}
                  <Text style={styles.titleAccent}>
                    Saheli
                  </Text>
                </Text>

                <Text style={styles.subtitle}>
                  Every beautiful journey begins with
                  a little hello. Tell us who you are.
                </Text>
              </Animated.View>

              {/* Registration form */}
              <View
                style={[
                  styles.form,
                  compact && styles.formCompact,
                ]}
              >
                <View style={styles.fieldGroup}>
                  <FormField
                    label="FULL NAME *"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Your full name"
                    autoCapitalize="words"
                    autoComplete="name"
                    error={submitted ? nameError : ""}
                  />

                  <FormField
                    label="EMAIL ADDRESS *"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoComplete="email"
                    error={submitted ? emailError : ""}
                  />
                </View>

                <Text style={styles.fieldLabel}>
                  YOUR MOBILE NUMBER *
                </Text>

                <View
                  style={[
                    styles.inputCard,
                    focused && styles.inputCardFocused,
                  ]}
                >
                  <View style={styles.codeBox}>
                    <Text style={styles.flag}>PK</Text>
                    <Text style={styles.countryCode}>
                      +92
                    </Text>
                  </View>

                  <View style={styles.separator} />

                  <TextInput keyboardAppearance="dark" selectionColor={colors.primary} underlineColorAndroid="transparent"
                    value={phone}
                    onChangeText={(value) => {
                      setPhone(
                        value.replace(/\D/g, "").slice(0, 10)
                      );
                    }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={styles.phoneInput}
                    placeholder="300 1234567"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    autoComplete="tel"
                    maxLength={10}
                    returnKeyType="done"
                    accessibilityLabel="Mobile number"
                  />

                  {isValidPhone && (
                    <View style={styles.validCircle}>
                      <Text style={styles.validCheck}>
                        ✓
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.helperRow}>
                  <View style={styles.helperDot} />
                  <Text style={styles.helperText}>
                    We'll email you a one-time code to verify your account.
                  </Text>
                </View>
              </View>
            </View>

            {/* Continue button */}
            <View style={styles.footer}>
              <InlineFeedback feedback={feedback} />
<Pressable
                onPress={handleContinue}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Continue to verification"
                accessibilityState={{
                  disabled: isSubmitting,
                  busy: isSubmitting,
                }}
                style={({ pressed }) => [
                  styles.continueButton,
                  !canContinue && styles.disabledButton,
                  pressed &&
                    canContinue &&
                    !isSubmitting &&
                    styles.pressedButton,
                ]}
              >
                <Text style={[styles.continueText, (!canContinue || isSubmitting) && { color: colors.textMuted }]}>
                  {isSubmitting ? "Sending code…" : "Continue"}
                </Text>

                <View style={styles.arrowCircle}>
                  <Text style={styles.arrowText}>
                    →
                  </Text>
                </View>
              </Pressable>

              <Text style={styles.footerNote}>
                YOUR JOURNEY. YOUR PACE. YOUR CITY.
              </Text>

              <Text style={styles.terms}>
                By continuing, you agree to our Terms of Service
                and Privacy Policy.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ScreenContainer>
  );
}
