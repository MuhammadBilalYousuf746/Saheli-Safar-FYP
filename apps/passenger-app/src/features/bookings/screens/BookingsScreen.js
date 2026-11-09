import React, { useLayoutEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useReducedMotion } from "../../../theme/useReducedMotion";
import ScreenContainer from "../../../components/ScreenContainer";
import SaheliIcon from "../../../components/icons/SaheliIcon";
import { colors } from "../../../theme/colors";
import { NavigationError, usePassengerNavigation } from "../../../navigation/PassengerBottomNavigation";

export default function BookingsScreen() {
  const [segment, setSegment] = useState("Upcoming");
  const reduced = useReducedMotion();
  const [controlWidth, setControlWidth] = useState(0);
  const position = useRef(new Animated.Value(0)).current, content = useRef(new Animated.Value(1)).current;
  const selected = useRef("Upcoming"), direction = useRef(1), first = useRef(true);
  const itemWidth = Math.max(0, (controlWidth - 15) / 2);
  const choose = next => {
    if (selected.current === next) return;
    direction.current = next === "History" ? 1 : -1;
    selected.current = next; setSegment(next);
  };
  useLayoutEffect(() => {
    position.stopAnimation(); content.stopAnimation();
    const target = segment === "History" ? 1 : 0;
    if (first.current || reduced) {
      first.current = false; position.setValue(target); content.setValue(1); return;
    }
    content.setValue(0);
    const movement = Animated.parallel([
      Animated.timing(position, { toValue: target, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== "web" }),
      Animated.timing(content, { toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== "web" }),
    ]);
    movement.start(); return () => movement.stop();
  }, [segment, reduced, position, content]);
  const { open, error } = usePassengerNavigation();
  return <ScreenContainer scrollable edges={["top"]} contentStyle={styles.content}>
    <Text accessibilityRole="header" style={styles.title}>My Bookings</Text>
    <View accessibilityRole="tablist" accessibilityLabel="Booking view" onLayout={event => setControlWidth(event.nativeEvent.layout.width)} style={styles.segments}>
      <Animated.View testID="booking-segment-indicator" pointerEvents="none" aria-hidden={true} style={[styles.indicator, { width: itemWidth, transform: [{ translateX: position.interpolate({ inputRange: [0, 1], outputRange: [0, itemWidth + 5] }) }] }]} />
      {["Upcoming", "History"].map(label => <Pressable key={label} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: segment === label }} aria-selected={segment === label} onPress={() => choose(label)} style={({ pressed }) => [styles.segment, pressed && styles.pressed]}><Text style={[styles.segmentText, segment === label && styles.selectedText]}>{label}</Text></Pressable>)}
    </View>
    <NavigationError message={error} />
    <Animated.View testID="booking-empty-state" style={[styles.empty, { opacity: content.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }), transform: [{ translateX: content.interpolate({ inputRange: [0, 1], outputRange: [direction.current * 8, 0] }) }] }]} >
      <View style={styles.illustration} aria-hidden={true}><View style={styles.routeLine} /><SaheliIcon name="ticket" size={52} color={colors.primaryLight} secondary={colors.iconPeriwinkle} /><View style={styles.stop} /></View>
      <Text accessibilityLiveRegion="polite" accessibilityRole="header" style={styles.emptyTitle}>{segment === "Upcoming" ? "No upcoming bookings" : "No booking history yet"}</Text>
      <Text style={[styles.body, styles.center]}>{segment === "Upcoming" ? "Your next journey will appear here when live booking is available." : "Completed journeys will appear here when live booking is available."}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Explore scheduled travel" onPress={() => open("Explore")} style={({ pressed }) => [styles.explore, pressed && styles.pressed]}><SaheliIcon name="compass" size={23} /><Text style={styles.exploreText}>Explore Karachi</Text><SaheliIcon name="arrow-right" size={20} /></Pressable>
    </Animated.View>
    <View style={styles.note}><SaheliIcon name="info" size={21} color={colors.textMuted} /><Text style={[styles.body, { flex: 1 }]}>Live booking is not connected. Reservations and tickets are unavailable.</Text></View>
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 16, gap: 18 }, title: { color: colors.textPrimary, fontFamily: "Inter_700Bold", fontSize: 20, lineHeight: 28, letterSpacing: -0.7 }, body: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 22 },
  segments: { padding: 5, borderRadius: 17, backgroundColor: colors.surfaceAlt, flexDirection: "row", gap: 5, position: "relative" }, segment: { flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", borderRadius: 13 }, indicator: { position: "absolute", left: 5, top: 5, bottom: 5, borderRadius: 13, backgroundColor: colors.primaryDark }, segmentText: { color: colors.textSecondary, fontFamily: "Inter_500Medium", fontSize: 13 }, selectedText: { color: colors.textPrimary, fontFamily: "Inter_700Bold", textDecorationLine: "underline" },
  empty: { alignItems: "center", paddingVertical: 16, gap: 14 }, illustration: { width: 112, height: 92, alignItems: "center", justifyContent: "center" }, routeLine: { position: "absolute", top: 13, left: 4, right: 3, bottom: 13, borderWidth: 1, borderColor: colors.primaryDark, borderRadius: 30, transform: [{ rotate: "-12deg" }] }, stop: { position: "absolute", bottom: 11, right: 22, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.iconPeriwinkle },
  emptyTitle: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 20, lineHeight: 28, textAlign: "center" }, center: { textAlign: "center", maxWidth: 290 }, explore: { marginTop: 2, minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 18, borderRadius: 15, backgroundColor: colors.accentLight }, exploreText: { color: colors.primaryLight, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  note: { flexDirection: "row", gap: 10, borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 20 }, pressed: { opacity: 0.78 },
});
