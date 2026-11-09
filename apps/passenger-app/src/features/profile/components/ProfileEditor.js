import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../../theme/colors";
import SaheliLoader from '../../../components/SaheliLoader';
import { validateProfileDraft } from "../services/passenger-profile.api";

export default function ProfileEditor({ mode, profile, busy, serverErrors, error, onSave, onCancel }) {
  const [draft, setDraft] = useState(mode === "name" ? { fullName: profile.fullName || "" }
    : { name: "", phone: "", relationship: "", ...profile.emergencyContact });
  const [errors, setErrors] = useState({});
  const [focused, setFocused] = useState(null);
  const fields = mode === "name" ? [["fullName", "Full name", 80]] : [
    ["name", "Contact name", 80], ["phone", "Contact phone", 20], ["relationship", "Relationship", 40],
  ];
  const save = () => {
    const validation = validateProfileDraft(mode, draft);
    setErrors(validation);
    if (!Object.keys(validation).length) onSave(draft);
  };
  return <View style={styles.form}>
    <Text accessibilityRole="header" style={styles.heading}>{mode === "name" ? "Edit Profile" : "Emergency contact"}</Text>
    {mode === "name" && <Text style={styles.hint}>Email and phone are sign-in details and remain read-only.</Text>}
    {fields.map(([key, label, maxLength]) => <View key={key} style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput keyboardAppearance="dark" selectionColor={colors.primary} placeholderTextColor={colors.textMuted} underlineColorAndroid="transparent" accessibilityLabel={mode === "name" ? "Passenger full name" : label}
        value={draft[key]} editable={!busy} maxLength={maxLength}
        onChangeText={value => { setDraft(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: null })); }}
        keyboardType={key === "phone" ? "phone-pad" : "default"}
        autoCapitalize={key === "phone" ? "none" : "words"} autoCorrect={false}
        onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
        style={[styles.input, focused === key && styles.focused, (errors[key] || serverErrors[key]) && styles.invalid]} />
      {!!(errors[key] || serverErrors[key]) && <Text accessibilityRole="alert" style={styles.error}>{errors[key] || serverErrors[key]}</Text>}
    </View>)}
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Pressable accessibilityRole="button" accessibilityLabel={mode === "name" ? "Save profile" : "Save contact"}
      accessibilityState={{ busy }} disabled={busy} onPress={save} style={styles.save}>
      {busy ? <SaheliLoader mode="inline" color={colors.textOnPrimary} label="Saving changes" /> : <Text style={styles.saveText}>Save</Text>}
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Cancel edit" disabled={busy} onPress={onCancel} style={styles.cancel}>
      <Text style={styles.label}>Cancel</Text>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
    padding: 22,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  field: {
    gap: 8
  },
  heading: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: colors.textPrimary
  },
  hint: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21
  },
  label: {
    fontFamily: "Inter_500Medium",
    color: colors.textPrimary
  },
  input: {
    fontSize: 16,
    minHeight: 56,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.input,
    color: colors.textPrimary,
    fontFamily: "Inter_400Regular"
  },
  invalid: {
    borderColor: colors.error
  },
  focused: {
    borderColor: colors.focus
  },
  error: {
    color: colors.error,
    fontFamily: "Inter_400Regular",
    lineHeight: 21
  },
  save: {
    minHeight: 56,
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 16
  },
  saveText: {
    color: colors.textOnPrimary,
    fontFamily: "Inter_600SemiBold"
  },
  cancel: {
    minHeight: 48,
    padding: 12,
    alignItems: "center",
    justifyContent: "center"
  }
});
