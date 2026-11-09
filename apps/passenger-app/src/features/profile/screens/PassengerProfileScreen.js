import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import SaheliLoader from '../../../components/SaheliLoader';
import { useRouter } from "expo-router";
import { NavigationError, usePassengerNavigation } from "../../../navigation/PassengerBottomNavigation";
import { backToPassengerHome } from "../../../navigation/passenger-navigation";
import ScreenContainer from "../../../components/ScreenContainer";
import BackButton from '../../../components/BackButton';
import SaheliIcon from "../../../components/icons/SaheliIcon";
import { colors } from "../../../theme/colors";
import { useAuthSession } from "../../auth/context/AuthSessionContext";
import ProfileEditor from "../components/ProfileEditor";
import SaheliMemberCard from "../components/SaheliMemberCard";
import { IconAction, InfoRow, profileStyles as shared } from "../components/ProfilePrimitives";
import usePassengerProfile from "../hooks/usePassengerProfile";
import { VERIFICATION_LABELS } from "../../verification/services/verification.api";

export default function PassengerProfileScreen() {
  const { confirmLogout } = useAuthSession(), router = useRouter();
  const { open, error: navigationError } = usePassengerNavigation();
  const { state, profile, identity, editing, saving, saveError, fieldErrors, load, beginEdit, cancelEdit, saveChanges } = usePassengerProfile({ includeIdentity: true });
  const identityStatus = !identity.error && identity.status;
  const identityLabel = identity.loading ? "Checking status" : VERIFICATION_LABELS[identityStatus] || "Status unavailable";
  const identityColor = identityStatus === "approved" ? colors.success : identityStatus === "rejected" ? colors.error : identityStatus === "pending_review" ? colors.warning : identityStatus === "not_submitted" ? colors.info : colors.textMuted;
  const header = <View style={shared.header}>
    <BackButton compact onPress={() => backToPassengerHome(router)} />
    <Text accessibilityRole="header" style={shared.headerTitle}>Your account</Text>
    <IconAction label="Refresh profile" icon="arrow-clockwise" onPress={load} busy={state.loading || identity.loading} disabled={state.loading || identity.loading || saving || !!editing} />
  </View>;
  const entry = (label, icon, description, status, tone = colors.textSecondary) => <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={saving} onPress={() => open(label)} style={({ pressed }) => [styles.entry, pressed && shared.pressed]}>
    <SaheliIcon name={icon} size={27} color={label === "Identity Verification" && identityStatus === "approved" ? colors.success : colors.primaryLight} />
    <View style={styles.entryCopy}><Text style={styles.entryTitle}>{label}</Text>{!!description && <Text style={shared.muted}>{description}</Text>}{status && <Text style={[styles.entryStatus, { color: tone }]}>{status}</Text>}</View>
    <SaheliIcon name="caret-right" size={18} color={colors.textMuted} />
  </Pressable>;
  return <ScreenContainer scrollable keyboardAvoiding edges={["top"]} contentStyle={shared.content}>
    {profile ? <SaheliMemberCard fullName={profile.fullName} phone={profile.phone} email={profile.email} identityLabel={identityLabel} identityColor={identityColor} header={header} /> : header}
    <NavigationError message={navigationError} />
    {!!state.error && <View style={shared.group}><Text accessibilityRole="alert" style={shared.error}>{state.error}{profile ? " Your last loaded details are still shown." : ""}</Text>{![401,403,404].includes(state.status) && <Pressable accessibilityRole="button" accessibilityLabel="Retry profile" onPress={load} style={shared.textAction}><Text style={shared.link}>Try again</Text></Pressable>}</View>}
    {identity.error && <Text accessibilityRole="alert" style={shared.muted}>Identity status could not be refreshed. Try again later.</Text>}
    {!profile && state.loading && <SaheliLoader label="Loading profile" />}
    {!!saveError && !editing && <Text accessibilityRole="alert" style={shared.error}>{saveError}</Text>}
    {profile && <>
      <View style={shared.group}>
        <View style={shared.sectionHeader}><Text accessibilityRole="header" style={shared.sectionLabel}>PERSONAL INFORMATION</Text>
          {!editing && <Pressable accessibilityRole="button" accessibilityLabel="Edit Profile" disabled={saving || state.loading} onPress={() => beginEdit("name")} style={shared.textAction}><SaheliIcon name="pencil-simple" size={19} /><Text style={shared.link}>Edit</Text></Pressable>}
        </View>
        <View style={shared.card}><InfoRow label="Full name" value={profile.fullName} /><InfoRow label="Email address" value={profile.email} /><InfoRow label="Phone number" value={profile.phone} last /></View>
        {editing && <ProfileEditor mode="name" profile={editing.base} busy={saving} serverErrors={fieldErrors} error={saveError} onSave={draft => saveChanges("name", draft, editing.base)} onCancel={cancelEdit} />}
      </View>
      <View style={shared.group}><Text accessibilityRole="header" style={shared.sectionLabel}>IDENTITY &amp; SAFETY</Text>
        <View style={styles.entries}>{entry("Identity Verification", "shield-check", null, identityLabel, identityColor)}<View style={styles.separator} />{entry("Emergency Contact", "phone", profile.emergencyContact ? "Saved contact" : "Not added")}</View>
      </View>
      <View style={styles.account}><Text style={styles.footnote}>Email & phone are read-only. Identity review is separate from email verification.</Text></View>
    </>}
    <Pressable accessibilityRole="button" accessibilityLabel="Log out" onPress={confirmLogout} style={({ pressed }) => [styles.logout, pressed && shared.pressed]}><SaheliIcon name="sign-out" size={23} color={colors.textSecondary} /><Text style={styles.logoutText}>Log out</Text></Pressable>
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  entries: { borderRadius: 20, backgroundColor: colors.backgroundDark, overflow: "hidden" },
  entry: { paddingHorizontal: 15, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64 },
  entryCopy: { flex: 1, gap: 3 }, entryTitle: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 22 },
  entryStatus: { fontFamily: "Inter_500Medium", fontSize: 12, lineHeight: 18 }, separator: { height: 1, backgroundColor: colors.divider, marginHorizontal: 16 },
  account: { gap: 7 }, footnote: { color: colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 20 },
  logout: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  logoutText: { color: colors.textSecondary, fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
