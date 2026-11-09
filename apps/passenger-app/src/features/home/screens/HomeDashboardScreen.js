import React from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import TravelSpaceCarousel from "../components/TravelSpaceCarousel";
import useHomeEntrance from "../components/useHomeEntrance";
import ScreenContainer from "../../../components/ScreenContainer";
import SaheliIcon from "../../../components/icons/SaheliIcon";
import MobilityArtwork from "../../../components/MobilityArtwork";
import { colors } from "../../../theme/colors";
import { useAuthSession } from "../../auth/context/AuthSessionContext";
import { NavigationError, usePassengerNavigation } from "../../../navigation/PassengerBottomNavigation";

export default function HomeDashboardScreen() {
  const { session, confirmLogout } = useAuthSession();
  const { open, error } = usePassengerNavigation();
  const entrance = useHomeEntrance();
  const compact = useWindowDimensions().height < 740;
  return <ScreenContainer scrollable edges={["top"]} contentStyle={styles.content}>
    <Animated.View testID="home-entrance" {...(Platform.OS === "web" ? { dataSet: { entranceId: entrance.entranceId || "none" } } : {})} style={[{ gap: 16 }, entrance.page]}>
    <View style={styles.header}>
      <View style={styles.greetingCopy}><Text style={styles.hello}>Hello,</Text><Text numberOfLines={2} style={styles.greeting}>{session.user.fullName || "Passenger"}</Text></View>
      <Pressable testID="home-logout" accessibilityRole="button" accessibilityLabel="Log out" onPress={confirmLogout} style={styles.logoutTouch}>
        {({ pressed }) => <View testID="home-logout-surface" style={[styles.logoutSurface, pressed && styles.logoutPressed]}><SaheliIcon name="sign-out" size={21} color={colors.primaryLight} /></View>}
      </Pressable>
    </View>
    <NavigationError message={error} />
    <Animated.View testID="home-hero" style={[styles.hero, entrance.hero]}>
      <Text accessibilityRole="header" style={[styles.headline, compact && styles.compactHeadline]}>Your city.{'\n'}Your own way.</Text>
      <View style={[styles.artwork, compact && styles.compactArtwork]}><MobilityArtwork /></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Find a Ride" onPress={() => open("Explore")} style={({ pressed }) => [styles.cta, pressed && styles.pressed]}><Text style={styles.ctaText}>Explore rides</Text><SaheliIcon name="arrow-right" size={21} color={colors.textOnPrimary} /></Pressable>
      <Text style={styles.availability}>Explore Karachi areas. Live rides are not available yet.</Text>
    </Animated.View>
    <Animated.View style={[styles.travel, entrance.supporting]}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>Your travel space</Text>
      <TravelSpaceCarousel onOpen={open} />
    </Animated.View>
    <Pressable accessibilityRole="button" accessibilityLabel="Identity Verification" onPress={() => open("Identity Verification")} style={({ pressed }) => [styles.safety, pressed && styles.pressed]}><SaheliIcon name="shield-check" size={27} /><View style={styles.safetyCopy}><Text style={styles.quickTitle}>Identity Verification</Text><Text style={styles.meta}>View your CNIC & selfie review</Text></View><SaheliIcon name="caret-right" size={18} color={colors.textMuted} /></Pressable>
    </Animated.View>
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { paddingTop: 12, paddingBottom: 16, gap: 16 }, header: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12 }, greetingCopy: { flex: 1, gap: 3 },
  hello: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 }, greeting: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 20, lineHeight: 27, letterSpacing: -0.5 },
  hero: { padding: 18, borderRadius: 24, backgroundColor: colors.surface, gap: 10 },
  logoutTouch: { width: 44, height: 44, borderRadius: 13, borderWidth: 0, alignItems: "center", justifyContent: "center" },
  logoutSurface: { width: 38, height: 38, borderRadius: 13, borderWidth: 0, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  logoutPressed: { backgroundColor: colors.surfaceAlt },
  headline: { color: colors.textPrimary, fontFamily: "PlayfairDisplay_600SemiBold", fontSize: 29, lineHeight: 36, letterSpacing: -0.5 }, compactHeadline: { fontSize: 25, lineHeight: 31 },
  artwork: { width: "100%", maxWidth: 265, alignSelf: "center" }, compactArtwork: { maxWidth: 195 },
  cta: { minHeight: 48, paddingHorizontal: 16, borderRadius: 15, backgroundColor: colors.signature, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, ctaText: { color: colors.textOnPrimary, fontFamily: "Inter_700Bold", fontSize: 14 },
  availability: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 17 }, travel: { gap: 12 }, sectionTitle: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 16, lineHeight: 23 },
  quickTitle: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 13, lineHeight: 20 },
  safety: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider, gap: 12 }, safetyCopy: { flex: 1, gap: 3 }, meta: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 19 }, pressed: { opacity: 0.76 },
});
