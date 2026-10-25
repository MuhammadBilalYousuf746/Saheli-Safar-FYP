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

import { VEHICLE_TYPES, validateVehicle } from "../utils/validation";
import { REGISTRATION_STEPS } from "./RegisterScreen";

const TYPE_ICONS = {
  car: "🚗",
  bike: "🏍️",
  rickshaw: "🛺",
};

// STEP 4: Vehicle details.
export default function VehicleScreen({ navigation, route }) {
  const params = route?.params || {};
  const saved = params.vehicle || {};

  const [vehicle, setVehicle] = useState({
    type: saved.type || "",
    make: saved.make || "",
    model: saved.model || "",
    color: saved.color || "",
    year: saved.year ? String(saved.year) : "",
    plateNumber: saved.plateNumber || "",
  });
  const [submitted, setSubmitted] = useState(false);

  const errors = validateVehicle(vehicle);
  const show = (field) => (submitted ? errors[field] || "" : "");

  const update = (field) => (value) =>
    setVehicle((current) => ({ ...current, [field]: value }));

  const handleContinue = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    navigation.navigate("CreatePassword", {
      ...params,
      vehicle: {
        type: vehicle.type,
        make: vehicle.make.trim(),
        model: vehicle.model.trim(),
        color: vehicle.color.trim(),
        year: Number(vehicle.year),
        plateNumber: vehicle.plateNumber.trim().toUpperCase(),
      },
    });
  };

  return (
    <ScreenContainer
      footer={<AppButton title="Continue" onPress={handleContinue} />}
    >
      <StepHeader
        step={4}
        total={REGISTRATION_STEPS}
        onBack={() => navigation.goBack()}
      />

      <ScreenIntro
        eyebrow="STEP 4 · VEHICLE"
        title="What will you"
        accent="drive?"
        description="Passengers see your vehicle details when you arrive."
      />

      <Text style={styles.label}>VEHICLE TYPE</Text>
      <View style={styles.typeRow}>
        {VEHICLE_TYPES.map((option) => {
          const selected = vehicle.type === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => update("type")(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.typeCard, selected && styles.typeCardSelected]}
            >
              <Text style={styles.typeIcon}>{TYPE_ICONS[option.value]}</Text>
              <Text
                style={[styles.typeText, selected && styles.typeTextSelected]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!!show("type") && <Text style={styles.error}>{show("type")}</Text>}

      <View style={styles.form}>
        <View style={styles.row}>
          <TextField
            style={styles.half}
            label="MAKE"
            value={vehicle.make}
            onChangeText={update("make")}
            placeholder="Suzuki"
            autoCapitalize="words"
            maxLength={40}
            error={show("make")}
          />
          <TextField
            style={styles.half}
            label="MODEL"
            value={vehicle.model}
            onChangeText={update("model")}
            placeholder="Alto"
            autoCapitalize="words"
            maxLength={40}
            error={show("model")}
          />
        </View>

        <View style={styles.row}>
          <TextField
            style={styles.half}
            label="COLOR"
            value={vehicle.color}
            onChangeText={update("color")}
            placeholder="White"
            autoCapitalize="words"
            maxLength={30}
            error={show("color")}
          />
          <TextField
            style={styles.half}
            label="YEAR"
            value={vehicle.year}
            onChangeText={(value) =>
              update("year")(value.replace(/\D/g, "").slice(0, 4))
            }
            placeholder="2020"
            keyboardType="number-pad"
            maxLength={4}
            error={show("year")}
          />
        </View>

        <TextField
          label="PLATE NUMBER"
          value={vehicle.plateNumber}
          onChangeText={(value) => update("plateNumber")(value.toUpperCase())}
          placeholder="LEA-1234"
          autoCapitalize="characters"
          maxLength={15}
          error={show("plateNumber")}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.textSecondary,
  },

  typeRow: {
    flexDirection: "row",
    gap: 10,
  },

  typeCard: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },

  typeIcon: {
    fontSize: 26,
  },

  typeText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.textSecondary,
  },

  typeTextSelected: {
    color: colors.primary,
  },

  error: {
    marginTop: 8,
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.error,
  },

  form: {
    marginTop: 20,
    gap: 18,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  half: {
    flex: 1,
  },
});
