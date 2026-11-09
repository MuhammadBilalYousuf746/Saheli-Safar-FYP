import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, FlatList, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import SaheliIcon from "../../../components/icons/SaheliIcon";
import { colors } from "../../../theme/colors";
import { useReducedMotion } from "../../../theme/useReducedMotion";
import { nearestTravelCard, travelCardLayout, TRAVEL_CARDS } from "./travel-cards";

const TravelCard = memo(function TravelCard({ item, index, width, height, onOpen, onMeasure, onFocus }) {
  const profile = item.kind === "profile", bookings = item.kind === "bookings";
  return <Pressable testID={`travel-card-${item.id}`} accessibilityRole="button" accessibilityLabel={item.label}
    accessibilityHint={item.description} onPress={() => onOpen(item.destination)} onFocus={onFocus}
    onLayout={onMeasure} style={({ pressed }) => [styles.card, { width, minHeight: height }, profile && styles.profileCard, bookings && styles.bookingCard,
      pressed && styles.pressed, Platform.OS === "web" && { scrollSnapAlign: index === TRAVEL_CARDS.length - 1 ? "end" : "start", scrollSnapStop: "always" }]}>
    <View style={[styles.cardTop, profile && styles.profileTop]}>
      <View style={[styles.icon, bookings && styles.ticketIcon, profile && styles.avatarIcon]}><SaheliIcon name={item.icon} size={profile ? 38 : 33} secondary={bookings ? colors.iconPeriwinkle : colors.primaryLight} /></View>
      {item.kind === "explore" ? <View aria-hidden={true} style={styles.route}><View style={styles.routeLine} /><View style={styles.routeStop} /></View>
        : <Text style={styles.category}>{bookings ? "YOUR JOURNEYS" : profile ? "PERSONAL" : item.kind === "contact" ? "YOUR SAFETY" : "CNIC & SELFIE"}</Text>}
    </View>
    <View style={styles.copy}><Text style={styles.title}>{item.title}</Text><Text style={styles.description}>{item.description}</Text></View>
    <View style={[styles.action, bookings && styles.ticketAction]}><Text style={styles.actionText}>{item.action}</Text><SaheliIcon name="arrow-right" size={19} /></View>
  </Pressable>;
});

function PageDot({ item, index, active, reduced, onPress }) {
  const value = useRef(new Animated.Value(active ? 1 : 0)).current;
  useEffect(() => {
    value.stopAnimation();
    const animation = Animated.timing(value, { toValue: active ? 1 : 0, duration: reduced ? 0 : 180, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== "web" });
    animation.start(); return () => animation.stop();
  }, [active, reduced, value]);
  return <Pressable accessibilityRole="button" accessibilityLabel={`Show travel card ${index + 1}: ${item.title}`} accessibilityState={{ selected: active }} aria-pressed={active} onPress={onPress} style={styles.pageButton}>
    <Animated.View aria-hidden={true} style={[styles.dot, { opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }), transform: [{ scaleX: value.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }] }]} />
  </Pressable>;
}

export default function TravelSpaceCarousel({ onOpen }) {
  const reduced = useReducedMotion(), { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0), [active, setActive] = useState(0);
  const minimumHeight = Math.ceil(204 * Math.max(1, fontScale));
  const [height, setHeight] = useState(minimumHeight);
  const list = useRef(null), activeRef = useRef(0), sizing = useMemo(() => travelCardLayout(width), [width]);
  const goTo = useCallback((index, animated = !reduced) => {
    list.current?.scrollToOffset({ offset: sizing.offsets[index], animated });
  }, [sizing, reduced]);
  useEffect(() => {
    setHeight(minimumHeight);
    const frame = requestAnimationFrame(() => goTo(activeRef.current, false));
    return () => cancelAnimationFrame(frame);
  }, [width, minimumHeight, goTo]);
  const measure = useCallback(event => setHeight(current => Math.max(current, Math.ceil(event.nativeEvent.layout.height))), []);
  const update = useCallback(event => {
    const index = nearestTravelCard(event.nativeEvent.contentOffset.x, sizing.offsets);
    if (index !== activeRef.current) { activeRef.current = index; setActive(index); }
  }, [sizing]);
  const renderItem = useCallback(({ item, index }) => <TravelCard item={item} index={index} width={sizing.cardWidth} height={height} onOpen={onOpen} onMeasure={measure} onFocus={() => goTo(index, false)} />, [sizing.cardWidth, height, onOpen, measure, goTo]);
  return <View testID="travel-carousel" onLayout={event => setWidth(Math.round(event.nativeEvent.layout.width))}>
    {width > 0 && <FlatList ref={list} testID="travel-carousel-list" horizontal data={TRAVEL_CARDS} keyExtractor={item => item.id} renderItem={renderItem}
      initialNumToRender={5} maxToRenderPerBatch={5} removeClippedSubviews={false}
      ItemSeparatorComponent={Separator} getItemLayout={(_, index) => ({ length: sizing.cardWidth, offset: index * sizing.stride, index })}
      snapToOffsets={sizing.offsets} decelerationRate="fast" disableIntervalMomentum directionalLockEnabled nestedScrollEnabled
      showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" scrollEventThrottle={16} onScroll={update}
      style={[{ height }, Platform.OS === "web" && { scrollSnapType: "x mandatory" }]} contentContainerStyle={styles.listContent} />}
    <View testID="travel-pagination" style={styles.pagination}>
      {TRAVEL_CARDS.map((item, index) => <PageDot key={item.id} item={item} index={index} active={index === active} reduced={reduced} onPress={() => goTo(index)} />)}
    </View>
    <Text testID="travel-current-card" accessibilityLiveRegion="polite" style={styles.position}>{active + 1} / {TRAVEL_CARDS.length} · {TRAVEL_CARDS[active].title}</Text>
  </View>;
}
function Separator() { return <View style={{ width: 12 }} />; }

const styles = StyleSheet.create({
  listContent: { alignItems: "flex-start" }, card: { padding: 18, borderRadius: 22, backgroundColor: colors.surface, justifyContent: "space-between", gap: 15 },
  profileCard: { backgroundColor: colors.surfaceAlt }, bookingCard: { backgroundColor: colors.backgroundDark, borderWidth: 1, borderColor: colors.border },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }, profileTop: { flexDirection: "row-reverse" },
  icon: { width: 42, height: 42, justifyContent: "center" }, ticketIcon: { transform: [{ rotate: "-9deg" }] }, avatarIcon: { alignItems: "center", borderRadius: 24, backgroundColor: colors.backgroundDark },
  category: { color: colors.textSecondary, fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 1.2, flexShrink: 1 },
  route: { width: 48, height: 20, justifyContent: "center" }, routeLine: { height: 1, backgroundColor: colors.primaryDark, marginRight: 4 }, routeStop: { position: "absolute", right: 0, top: 7, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.signature },
  copy: { gap: 6 }, title: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 18, lineHeight: 25, letterSpacing: -0.3 },
  description: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 20 }, action: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }, ticketAction: { borderTopWidth: 1, borderTopColor: colors.divider, paddingTop: 12 },
  actionText: { color: colors.primaryLight, fontFamily: "Inter_600SemiBold", fontSize: 12, lineHeight: 20 }, pressed: { opacity: 0.82 },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center" }, pageButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, dot: { width: 6, height: 4, borderRadius: 3, backgroundColor: colors.primaryLight },
  position: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 10, lineHeight: 16, textAlign: "center" },
});
