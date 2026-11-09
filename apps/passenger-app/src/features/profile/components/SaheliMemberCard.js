import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import SaheliIcon from "../../../components/icons/SaheliIcon";
import { colors } from "../../../theme/colors";
import { maskEmail, maskPhone, passengerInitials } from "../services/profile-presentation";

// Only the measured decorative cap extends behind the navigation header.
// The existing profile API has no authorized photo field: use real initials.
export default function SaheliMemberCard({ fullName, phone, email, identityLabel, identityColor, header }) {
  const [bodyHeight, setBodyHeight] = useState(220);
  const cap = Math.max(60, Math.round(bodyHeight * 0.22 / 0.78));
  const initials = passengerInitials(fullName);
  return <View testID="member-card-stage" style={styles.stage}>
    <LinearGradient testID="saheli-member-card" colors={[colors.signature, colors.coral, colors.primaryDark, colors.memberCardEnd]} locations={[0, 0.45, 0.78, 1]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View testID="member-decorative-cap" aria-hidden={true} style={{ height: cap }} />
      <View testID="member-card-body" onLayout={event => setBodyHeight(Math.round(event.nativeEvent.layout.height))} style={styles.body}>
        <View style={styles.top}><Text style={styles.brand}>SAHELI SAFAR</Text><View aria-hidden={true} style={styles.signature} /></View>
        <View style={styles.identityRow}>
          <View testID="member-avatar" aria-hidden={true} style={styles.avatar}>{initials ? <Text style={styles.initials}>{initials}</Text> : <SaheliIcon name="user-circle" size={32} color={colors.textPrimary} />}</View>
          <Text testID="member-name" numberOfLines={2} ellipsizeMode="tail" style={styles.name}>{fullName || "Name not provided"}</Text>
        </View>
        <View testID="member-masked-contacts" style={styles.contacts}><Text style={styles.contact}>{maskPhone(phone)}</Text><Text numberOfLines={2} style={styles.contact}>{maskEmail(email)}</Text></View>
        <View style={styles.bottom}><Text style={styles.caption}>SAHELI CARD</Text><View style={styles.status}><View aria-hidden={true} style={[styles.dot, { backgroundColor: identityColor }]} /><Text testID="member-identity-status" accessibilityLabel={'Identity verification status: ' + identityLabel} accessibilityLiveRegion="polite" style={[styles.statusText, { color: identityColor }]}>{identityLabel}</Text></View></View>
      </View>
    </LinearGradient>
    <View testID="profile-card-header" style={[styles.header, { height: cap - 5 }]}>{header}</View>
  </View>;
}
const styles = StyleSheet.create({
  stage: { position: "relative" }, card: { borderRadius: 24, backgroundColor: colors.memberCardMiddle, overflow: "hidden" },
  header: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: colors.background, justifyContent: "center" },
  // A translucent Midnight surface keeps the real details readable over gold.
  body: { padding: 20, paddingTop: 16, gap: 13, backgroundColor: colors.background + '7A' }, top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  brand: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 10, letterSpacing: 2 }, signature: { width: 17, height: 3, borderRadius: 2, backgroundColor: colors.signature },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 12 }, avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.primaryLight, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  initials: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 16 }, name: { flex: 1, color: colors.textPrimary, fontFamily: "Inter_700Bold", fontSize: 23, lineHeight: 30, letterSpacing: -0.6 },
  contacts: { gap: 4 }, contact: { color: colors.textPrimary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 },
  bottom: { borderTopWidth: 1, borderTopColor: colors.primaryDark, paddingTop: 13, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 9 },
  caption: { color: colors.textPrimary, fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 1 }, status: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 }, dot: { width: 5, height: 5, borderRadius: 3 }, statusText: { fontFamily: "Inter_600SemiBold", fontSize: 11, lineHeight: 18, flexShrink: 1 },
});
