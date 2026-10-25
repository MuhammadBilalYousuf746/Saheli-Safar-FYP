import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ScreenContainer from "../../../components/ScreenContainer";
import StepHeader from "../../../components/StepHeader";
import ScreenIntro from "../../../components/ScreenIntro";
import TextField from "../../../components/TextField";
import AppButton from "../../../components/AppButton";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { radius } from "../../../theme/spacing";
import { showAlert } from "../../../utils/alert";

import { completeDriverProfile } from "../services/driver-auth.api";
import { saveDriverSession } from "../services/auth-session";
import { validatePassword } from "../utils/validation";
import { REGISTRATION_STEPS } from "./RegisterScreen";

const PASSWORD_RULES = [
  { label: "8+ characters", test: (value) => value.length >= 8 },
  { label: "Uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "Lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "Number", test: (value) => /\d/.test(value) },
];

// STEP 5: Create password and submit the full driver application.
export default function CreatePasswordScreen({ navigation, route }) {
  const params = route?.params || {};

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordError = validatePassword(password);
  const confirmError =
    confirmPassword !== password ? "Passwords do not match." : "";

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setSubmitted(true);
    if (passwordError || confirmError || !confirmPassword) return;

    try {
      setIsSubmitting(true);

      const response = await completeDriverProfile({
        onboardingToken: params.onboardingToken,
        password,
        confirmPassword,
        cnic: params.cnic,
        licenseNumber: params.licenseNumber,
        vehicle: params.vehicle,
      });

      await saveDriverSession({
        accessToken: response.accessToken,
        user: response.user,
      });

      setPassword("");
      setConfirmPassword("");

      showAlert(
        "Application Submitted",
        "Your details are with our verification team. You can go online once you're approved.",
        [
          {
            text: "Go to dashboard",
            onPress: () =>
              navigation.reset({ index: 0, routes: [{ name: "Home" }] }),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      // Onboarding token expired (30 minutes) or account already completed.
      if (error.status === 401 || error.status === 403) {
        showAlert(
          "Session Expired",
          "Your verification session has expired. Please verify your email again.",
          [
            {
              text: "Start again",
              onPress: () =>
                navigation.reset({
                  index: 1,
                  routes: [{ name: "Welcome" }, { name: "Register" }],
                }),
            },
          ]
        );
        return;
      }

      showAlert("Submission Failed", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggle = (visible, onPress) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={visible ? "Hide password" : "Show password"}
      hitSlop={8}
    >
      <Text style={styles.toggle}>{visible ? "Hide" : "Show"}</Text>
    </Pressable>
  );

  const { vehicle = {} } = params;

  return (
    <ScreenContainer
      footer={
        <AppButton
          title="Submit application"
          onPress={handleSubmit}
          loading={isSubmitting}
        />
      }
    >
      <StepHeader
        step={5}
        total={REGISTRATION_STEPS}
        onBack={() => navigation.goBack()}
      />

      <ScreenIntro
        eyebrow="STEP 5 · SECURE YOUR ACCOUNT"
        title="Almost"
        accent="there."
        description="Create a password, review your details and submit."
      />

      <View style={styles.form}>
        <TextField
          label="CREATE PASSWORD"
          value={password}
          onChangeText={setPassword}
          placeholder="Minimum 8 characters"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          rightAction={toggle(showPassword, () =>
            setShowPassword((value) => !value)
          )}
          error={submitted ? passwordError : ""}
        />

        <View style={styles.rules}>
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(password);

            return (
              <View
                key={rule.label}
                style={[styles.rule, passed && styles.rulePassed]}
              >
                <Text
                  style={[styles.ruleText, passed && styles.ruleTextPassed]}
                >
                  {passed ? "✓ " : ""}
                  {rule.label}
                </Text>
              </View>
            );
          })}
        </View>

        <TextField
          label="CONFIRM PASSWORD"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="new-password"
          error={submitted ? confirmError : ""}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>APPLICATION SUMMARY</Text>
        <SummaryRow label="Name" value={params.fullName} />
        <SummaryRow label="Email" value={params.email} />
        <SummaryRow label="Phone" value={params.phoneNumber} />
        <SummaryRow label="CNIC" value={params.cnic} />
        <SummaryRow label="License" value={params.licenseNumber} />
        <SummaryRow
          label="Vehicle"
          value={`${vehicle.make} ${vehicle.model} (${vehicle.year})`}
        />
        <SummaryRow
          label="Plate"
          value={`${vehicle.plateNumber} · ${vehicle.color}`}
        />
      </View>
    </ScreenContainer>
  );
}

const SummaryRow = ({ label, value }) => (
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue} numberOfLines={1}>
      {value || "—"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },

  toggle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.primary,
  },

  rules: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },

  rule: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },

  rulePassed: {
    backgroundColor: colors.successSoft,
  },

  ruleText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    color: colors.textMuted,
  },

  ruleTextPassed: {
    color: colors.success,
  },

  summary: {
    marginTop: 24,
    padding: 16,
    gap: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  summaryTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.primary,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },

  summaryLabel: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },

  summaryValue: {
    flexShrink: 1,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: "right",
  },
});
