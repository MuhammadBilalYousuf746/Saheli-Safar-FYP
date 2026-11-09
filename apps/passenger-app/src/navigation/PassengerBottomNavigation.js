import { colors } from "../theme/colors";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import SaheliIcon from "../components/icons/SaheliIcon";
import { typography } from "../theme/typography";
import { layout } from "../theme/spacing";
import { PASSENGER_TABS, openPassengerScreen, isPassengerTabActive } from "./passenger-navigation";

export function usePassengerNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState("");
  const open = (label) => {
    try {
      openPassengerScreen(router, pathname, label);
      setError("");
    } catch {
      setError("We couldn't open that screen. Please try again.");
    }
  };
  return { open, error, pathname };
}

export function NavigationError({ message }) {
  return message ? <Text accessibilityRole="alert" style={styles.error}>{message}</Text> : null;
}

// Shared family for persistent tabs and legacy feature callers.
export function PassengerTabIcon({ name, active }) {
  const names = { Home: "house", Explore: "compass", Bookings: "ticket", Profile: "user-circle" };
  return <SaheliIcon name={names[name] || "user-circle"} size={25} color={active ? colors.primaryLight : colors.textMuted} />;
}

export default function PassengerBottomNavigation() {
  const { open, error, pathname } = usePassengerNavigation();
  return <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
    <NavigationError message={error} />
    <View style={styles.bar}>
      {PASSENGER_TABS.map((tab) => {
        const active = isPassengerTabActive(pathname, tab);
        return <Pressable key={tab.label} accessibilityRole="button" accessibilityLabel={tab.label}
          aria-selected={active} onPress={() => open(tab.label)}
          style={({ pressed }) => [styles.tab, active && styles.activeTab, pressed && styles.pressed]}>
          <PassengerTabIcon name={tab.label} active={active} />
          <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          {active && <View style={styles.dot} />}
        </Pressable>;
      })}
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: colors.divider
  },
  bar: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center"
  },
  tab: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  activeTab: {
    backgroundColor: colors.accentLight
  },
  pressed: {
    backgroundColor: colors.surfaceAlt
  },
  label: {
    marginTop: 5,
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.textMuted
  },
  activeLabel: {
    color: colors.primaryLight
  },
  dot: {
    position: "absolute",
    bottom: 0,
    width: 16,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.primary
  },
  error: {
    padding: 12,
    color: colors.error,
    fontFamily: typography.fontFamily.medium,
    fontSize: 13,
    lineHeight: 20
  }
});
