import React, { useRef, useState } from "react";
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import ScreenContainer from "../../../components/ScreenContainer";
import SaheliIcon from "../../../components/icons/SaheliIcon";
import { colors } from "../../../theme/colors";
import { filterKarachiAreas } from "../data/karachi-areas";

export default function ExploreScreen() {
  const [query, setQuery] = useState(""), [selected, setSelected] = useState(null), [focused, setFocused] = useState(false);
  const input = useRef(null), results = filterKarachiAreas(query);
  const select = name => { setQuery(name); setSelected(name); Keyboard.dismiss(); input.current?.blur(); };
  return <ScreenContainer scrollable keyboardAvoiding edges={["top"]} contentStyle={styles.content}>

    <View style={[styles.search, focused && styles.focused]}><SaheliIcon name="magnifying-glass" size={22} /><TextInput ref={input} accessibilityLabel="Search Karachi areas" value={query} onChangeText={value => { setQuery(value); setSelected(null); }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onSubmitEditing={() => { if (results.length === 1) select(results[0]); else Keyboard.dismiss(); }} placeholder="Search an area" placeholderTextColor={colors.textMuted} keyboardAppearance="dark" selectionColor={colors.primary} autoCapitalize="none" autoCorrect={false} returnKeyType="search" underlineColorAndroid="transparent" style={styles.input} />{!!query && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => { setQuery(""); setSelected(null); input.current?.focus(); }} style={styles.clear}><SaheliIcon name="x" size={20} color={colors.textSecondary} /></Pressable>}</View>
    {selected && <View accessibilityLiveRegion="polite" testID="selected-area" style={styles.selected}><SaheliIcon name="map-pin" size={24} /><View style={styles.copy}><Text style={styles.resultTitle}>{selected}</Text><Text style={styles.body}>Area selected. No ride has been booked.</Text></View></View>}
    <View style={styles.section}><Text accessibilityRole="header" style={styles.sectionTitle}>Explore Karachi areas</Text><Text style={styles.meta}>Informational places · not active Saheli routes</Text></View>
    <Text accessibilityLiveRegion="polite" style={styles.meta}>{results.length} {results.length === 1 ? "area" : "areas"}{query.trim() ? " found" : " to explore"}</Text>
    <View testID="area-results">{results.map(name => <Pressable key={name} accessibilityRole="button" accessibilityLabel={'Select ' + name} accessibilityState={{ selected: selected === name }} aria-pressed={selected === name} onPress={() => select(name)} style={({ pressed }) => [styles.result, pressed && styles.pressed]}><View style={styles.marker}><SaheliIcon name="map-pin" size={25} /></View><View style={styles.copy}><Text style={styles.resultTitle}>{name}</Text><Text style={styles.meta}>Karachi</Text></View><SaheliIcon name="caret-right" size={18} color={colors.textMuted} /></Pressable>)}</View>
    {!results.length && <View style={styles.empty}><SaheliIcon name="magnifying-glass" size={38} /><Text style={styles.resultTitle}>No matching areas</Text><Text style={styles.body}>Try a shorter name or clear your search.</Text><Pressable accessibilityRole="button" accessibilityLabel="Show all areas" onPress={() => { setQuery(""); setSelected(null); input.current?.focus(); }} style={styles.reset}><Text style={styles.resetText}>Show all areas</Text></Pressable></View>}
    <View style={styles.note}><SaheliIcon name="info" size={21} color={colors.textMuted} /><Text style={[styles.body, styles.copy]}>Live routes and booking are not connected. Areas do not indicate service coverage.</Text></View>
  </ScreenContainer>;
}
const styles = StyleSheet.create({
  content: { paddingTop: 16, paddingBottom: 16, gap: 12 }, eyebrow: { color: colors.primaryLight, fontFamily: "Inter_500Medium", fontSize: 9, letterSpacing: 1.5 },
  body: { color: colors.textSecondary, fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 21 },
  search: { minHeight: 56, paddingLeft: 16, paddingRight: 4, borderRadius: 17, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 10 }, focused: { borderColor: colors.focus },
  input: { flex: 1, minWidth: 0, minHeight: 52, color: colors.textPrimary, fontFamily: "Inter_400Regular", fontSize: 15, paddingVertical: 10, ...(Platform.OS === "web" ? { outlineStyle: "none" } : {}) }, clear: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  section: { gap: 6, paddingTop: 6 }, sectionTitle: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 17, lineHeight: 25 }, meta: { color: colors.textMuted, fontFamily: "Inter_400Regular", fontSize: 11, lineHeight: 18 },
  result: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.divider }, marker: { width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: colors.accentLight, borderRadius: 15 },
  copy: { flex: 1, gap: 4 }, resultTitle: { color: colors.textPrimary, fontFamily: "Inter_600SemiBold", fontSize: 14, lineHeight: 22 }, selected: { padding: 15, borderRadius: 16, backgroundColor: colors.surface, borderLeftWidth: 2, borderLeftColor: colors.signature, flexDirection: "row", gap: 12, alignItems: "center" },
  empty: { alignItems: "center", gap: 12, paddingVertical: 28 }, reset: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12 }, resetText: { color: colors.primaryLight, fontFamily: "Inter_600SemiBold", fontSize: 13 },
  note: { flexDirection: "row", gap: 10, paddingTop: 8 }, pressed: { backgroundColor: colors.accentLight },
});
