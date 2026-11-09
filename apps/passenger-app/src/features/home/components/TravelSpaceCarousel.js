import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
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

export default function TravelSpaceCarousel({ onOpen }) {
  const reduced = useReducedMotion(), { fontScale } = useWindowDimensions();
  const [width, setWidth] = useState(0);
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
  const measure = useCallback(event => {
    const measuredHeight = event?.nativeEvent?.layout?.height;
    if (!Number.isFinite(measuredHeight) || measuredHeight <= 0) return;
    const roundedHeight = Math.ceil(measuredHeight);
    setHeight(current => Math.max(current, roundedHeight));
  }, []);
  const update = useCallback(event => {
    const index = nearestTravelCard(event.nativeEvent.contentOffset.x, sizing.offsets);
    if (index !== activeRef.current) { activeRef.current = index; }
  }, [sizing]);
  const renderItem = useCallback(({ item, index }) => <TravelCard item={item} index={index} width={sizing.cardWidth} height={height} onOpen={onOpen} onMeasure={measure} onFocus={() => goTo(index, false)} />, [sizing.cardWidth, height, onOpen, measure, goTo]);
  return <View testID="travel-carousel" onLayout={event => setWidth(Math.round(event.nativeEvent.layout.width))}>
    {width > 0 && <FlatList ref={list} testID="travel-carousel-list" horizontal data={TRAVEL_CARDS} keyExtractor={item => item.id} renderItem={renderItem}
      initialNumToRender={5} maxToRenderPerBatch={5} removeClippedSubviews={false}
      ItemSeparatorComponent={Separator} getItemLayout={(_, index) => ({ length: sizing.cardWidth, offset: index * sizing.stride, index })}
      snapToOffsets={sizing.offsets} decelerationRate="fast" disableIntervalMomentum directionalLockEnabled nestedScrollEnabled
      showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" scrollEventThrottle={16} onScroll={update}
      style={[{ height }, Platform.OS === "web" && { scrollSnapType: "x mandatory" }]} contentContainerStyle={styles.listContent} />}
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
});
