import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import ScreenContainer from "../../../components/ScreenContainer";
import StepHeader from "../../../components/StepHeader";
import ScreenIntro from "../../../components/ScreenIntro";
import TextField from "../../../components/TextField";
import AppButton from "../../../components/AppButton";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { radius } from "../../../theme/spacing";

import {
  formatCnic,
  validateCnic,
  validateLicense,
} from "../utils/validation";
import { REGISTRATION_STEPS } from "./RegisterScreen";

// STEP 3: CNIC and driving license.
export default function DocumentsScreen({ navigation, route }) {
  const params = route?.params || {};

  const [cnic, setCnic] = useState(params.cnic || "");
  const [licenseNumber, setLicenseNumber] = useState(
    params.licenseNumber || ""
  );
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    cnic: validateCnic(cnic),
    licenseNumber: validateLicense(licenseNumber),
  };

  const handleContinue = () => {
    setSubmitted(true);
    if (errors.cnic || errors.licenseNumber) return;

    navigation.navigate("Vehicle", {
      ...params,
      cnic,
      licenseNumber: licenseNumber.trim().toUpperCase(),
    });
  };

  return (
    <ScreenContainer
      footer={<AppButton title="Continue" onPress={handleContinue} />}
    >
      <StepHeader
        step={3}
        total={REGISTRATION_STEPS}
        onBack={() => navigation.goBack()}
      />

      <ScreenIntro
        eyebrow="STEP 3 · DOCUMENTS"
        title="Your identity,"
        accent="verified."
        description="Our team checks these details before you can accept rides."
      />

      <View style={styles.verifiedCard}>
        <Text style={styles.verifiedIcon}>✓</Text>
        <View style={styles.verifiedText}>
          <Text style={styles.verifiedTitle}>{params.fullName}</Text>
          <Text style={styles.verifiedSub}>
            {params.email} · {params.phoneNumber}
          </Text>
        </View>
      </View>

      <View style={styles.form}>
        <TextField
          label="CNIC NUMBER"
          value={cnic}
          onChangeText={(value) => setCnic(formatCnic(value))}
          placeholder="35202-1234567-1"
          keyboardType="number-pad"
          maxLength={15}
          error={submitted ? errors.cnic : ""}
          hint="13 digits, as printed on your CNIC."
        />

        <TextField
          label="DRIVING LICENSE NUMBER"
          value={licenseNumber}
          onChangeText={(value) => setLicenseNumber(value.toUpperCase())}
          placeholder="LHR-12345"
          autoCapitalize="characters"
          maxLength={20}
          error={submitted ? errors.licenseNumber : ""}
        />
      </View>

      <View style={styles.note}>
        <Text style={styles.noteText}>
          🔒 Your CNIC and license are only visible to the Saheli Safar
          verification team.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  verifiedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 22,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.successSoft,
  },

  verifiedIcon: {
    fontSize: 18,
    color: colors.success,
  },

  verifiedText: {
    flex: 1,
  },

  verifiedTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },

  verifiedSub: {
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },

  form: {
    gap: 18,
  },

  note: {
    marginTop: 24,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },

  noteText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
