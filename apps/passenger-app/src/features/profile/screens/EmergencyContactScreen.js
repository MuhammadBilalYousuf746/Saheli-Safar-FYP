import React from "react";
import { Pressable, Text, View } from "react-native";
import SaheliLoader from '../../../components/SaheliLoader';
import ScreenContainer from "../../../components/ScreenContainer";
import BackButton from '../../../components/BackButton';
import SaheliIcon from "../../../components/icons/SaheliIcon";
import { NavigationError, usePassengerNavigation } from "../../../navigation/PassengerBottomNavigation";
import { colors } from "../../../theme/colors";
import { notifications } from "../../../notifications/notification-store";
import ProfileEditor from "../components/ProfileEditor";
import { IconAction, InfoRow, profileStyles as styles } from "../components/ProfilePrimitives";
import usePassengerProfile from "../hooks/usePassengerProfile";

export default function EmergencyContactScreen() {
  const { open, error } = usePassengerNavigation();
  const { state, profile, editing, saving, saveError, fieldErrors, load, beginEdit, cancelEdit, saveChanges } = usePassengerProfile();
  return <ScreenContainer scrollable keyboardAvoiding edges={["top"]} contentStyle={styles.content}>
    <View style={styles.header}><BackButton compact label="Back to Profile" onPress={() => open("Profile")} /><Text accessibilityRole="header" style={styles.headerTitle}>Emergency Contact</Text><IconAction label="Refresh contact" icon="arrow-clockwise" busy={state.loading} disabled={state.loading || saving || !!editing} onPress={load} /></View>

    <NavigationError message={error} />
    {!!state.error && <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>}
    {!profile && state.loading && <SaheliLoader label="Loading emergency contact" />}
    {profile && <>
      {editing ? <ProfileEditor mode="contact" profile={editing.base} busy={saving} serverErrors={fieldErrors} error={saveError} onSave={draft => saveChanges("contact", draft, editing.base)} onCancel={cancelEdit} /> : profile.emergencyContact ? <>
        <View style={styles.card}><InfoRow label="Name" value={profile.emergencyContact.name} /><InfoRow label="Phone" value={profile.emergencyContact.phone} /><InfoRow label="Relationship" value={profile.emergencyContact.relationship} last /></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit Contact" disabled={saving || state.loading} onPress={() => beginEdit("contact")} style={styles.textAction}><SaheliIcon name="pencil-simple" size={21} /><Text style={styles.link}>Edit contact</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Remove contact" disabled={saving || state.loading} onPress={() => notifications.confirm({ title: "Remove Emergency Contact?", message: "This removes your saved emergency contact.", primaryText: "Remove", secondaryText: "Cancel", destructive: true, onConfirm: () => saveChanges("contact", null, profile) })} style={styles.textAction}><Text style={styles.error}>{saving ? "Saving…" : "Remove contact"}</Text></Pressable>
      </> : <View style={styles.group}><Text style={styles.muted}>No emergency contact saved.</Text><Pressable accessibilityRole="button" accessibilityLabel="Add Contact" disabled={state.loading} onPress={() => beginEdit("contact")} style={styles.textAction}><SaheliIcon name="phone" size={22} /><Text style={styles.link}>Add emergency contact</Text></Pressable></View>}
      {!!saveError && !editing && <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text>}
    </>}
    <Text style={styles.muted}>Saving a contact does not call or notify them.</Text>
  </ScreenContainer>;
}
