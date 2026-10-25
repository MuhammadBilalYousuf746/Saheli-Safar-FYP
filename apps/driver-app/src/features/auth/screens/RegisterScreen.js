import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import ScreenContainer from "../../../components/ScreenContainer";
import StepHeader from "../../../components/StepHeader";
import ScreenIntro from "../../../components/ScreenIntro";
import TextField from "../../../components/TextField";
import AppButton from "../../../components/AppButton";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { showAlert } from "../../../utils/alert";

import { registerDriver } from "../services/driver-auth.api";
import {
  validateEmail,
  validateFullName,
  validatePhoneDigits,
} from "../utils/validation";

export const REGISTRATION_STEPS = 5;

// STEP 1: Name, email and phone. The OTP is emailed.
export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = {
    fullName: validateFullName(fullName),
    email: validateEmail(email),
    phone: validatePhoneDigits(phone),
  };

  const isValid = !errors.fullName && !errors.email && !errors.phone;

  const handleContinue = async () => {
    if (isSubmitting) return;

    setSubmitted(true);
    if (!isValid) return;

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const phoneNumber = `+92${phone}`;

    try {
      setIsSubmitting(true);

      await registerDriver({
        fullName: cleanName,
        email: cleanEmail,
        phone: phoneNumber,
      });

      navigation.navigate("VerifyOTP", {
        fullName: cleanName,
        email: cleanEmail,
        phoneNumber,
      });
    } catch (error) {
      showAlert("Registration Failed", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      footer={
        <AppButton
          title="Send verification code"
          onPress={handleContinue}
          loading={isSubmitting}
        />
      }
    >
      <StepHeader
        step={1}
        total={REGISTRATION_STEPS}
        onBack={() => navigation.goBack()}
      />

      <ScreenIntro
        eyebrow="STEP 1 · ABOUT YOU"
        title="Let's get you"
        accent="on the road."
        description="Tell us who you are. We'll email you a code to verify your account."
      />

      <View style={styles.form}>
        <TextField
          label="FULL NAME"
          value={fullName}
          onChangeText={setFullName}
          placeholder="As on your CNIC"
          autoCapitalize="words"
          autoComplete="name"
          error={submitted ? errors.fullName : ""}
        />

        <TextField
          label="EMAIL ADDRESS"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={submitted ? errors.email : ""}
          hint="Your verification code will be sent here."
        />

        <TextField
          label="MOBILE NUMBER"
          prefix="+92"
          value={phone}
          onChangeText={(value) =>
            setPhone(value.replace(/\D/g, "").replace(/^0/, "").slice(0, 10))
          }
          placeholder="300 1234567"
          keyboardType="phone-pad"
          autoComplete="tel"
          maxLength={10}
          error={submitted ? errors.phone : ""}
          hint="Passengers will reach you on this number during rides."
        />
      </View>

      <Text style={styles.terms}>
        By continuing, you agree to the Saheli Safar Driver Terms and
        Privacy Policy.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 18,
  },

  terms: {
    marginTop: 24,
    fontFamily: typography.fontFamily.regular,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textMuted,
  },
});
