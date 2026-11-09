import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import SaheliLoader from '../../../components/SaheliLoader';
import SaheliIcon from "../../../components/icons/SaheliIcon";
import { colors } from "../../../theme/colors";

export function IconAction({ label, icon, onPress, busy = false, disabled = false }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ busy, disabled }} aria-busy={busy} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [profileStyles.iconButton, pressed && profileStyles.pressed, disabled && { opacity: 0.5 }]}>
    {busy ? <SaheliLoader mode="inline" color={colors.primaryLight} label={label} /> : <SaheliIcon name={icon} size={23} />}
  </Pressable>;
}
export function InfoRow({ label, value, last = false }) {
  return <View testID="profile-info-row" style={[profileStyles.row, last && { borderBottomWidth: 0 }]}>
    <Text style={profileStyles.label}>{label}</Text><Text selectable style={profileStyles.value}>{value || "Not provided"}</Text>
  </View>;
}
export const profileStyles = StyleSheet.create({
  content: { paddingTop: 8, paddingBottom: 18, gap: 16 },
  header: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  headerTitle: { color: colors.textSecondary, fontFamily: "Inter_500Medium", fontSize: 14 },
  iconButton: { minWidth: 48, minHeight: 48, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  group: { gap: 10 }, sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  sectionLabel: { color: colors.textMuted, fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1.1, lineHeight: 18, flexShrink: 1 },
  card: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20, backgroundColor: colors.surface },
  row: { paddingVertical: 11, flexDirection: "row", alignItems: "flex-start", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.divider },
  label: { width: 90, color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  value: { flex: 1, minWidth: 0, flexShrink: 1, color: colors.textPrimary, fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 22 },
  title: { color: colors.textPrimary, fontFamily: "Inter_700Bold", fontSize: 18, lineHeight: 26 },
  muted: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 22 },
  error: { color: colors.error, fontFamily: "Inter_500Medium", fontSize: 13, lineHeight: 22 },
  textAction: { minHeight: 48, paddingHorizontal: 8, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center" },
  link: { color: colors.primaryLight, fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 20 },
  pressed: { backgroundColor: colors.accentLight },
});
