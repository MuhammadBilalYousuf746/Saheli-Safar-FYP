import { colors } from "../../../theme/colors";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../../../components/ScreenContainer";
import { NavigationError, PassengerTabIcon, usePassengerNavigation } from "../../../navigation/PassengerBottomNavigation";
import { typography } from "../../../theme/typography";

export default function PassengerTravelInfoScreen({ title, intro, status, description, icon, action, destination }) {
  const { open, error } = usePassengerNavigation();
  return <ScreenContainer scrollable edges={["top"]} contentStyle={styles.content}>
    <View style={styles.header}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back to Home" onPress={() => open("Home")} style={styles.back}>
        <Text style={styles.link}>‹ Home</Text>
      </Pressable>
      <Text style={styles.brand}>SAHELI SAFAR</Text>
    </View>
    <NavigationError message={error} />
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    <Text style={styles.intro}>{intro}</Text>
    <View style={styles.card}>
      <View style={styles.icon}><PassengerTabIcon name={icon} active /></View>
      <Text style={styles.badge}>IN PREPARATION</Text>
      <Text accessibilityRole="header" style={styles.status}>{status}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={action} onPress={() => open(destination)}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.buttonText}>{action}</Text>
    </Pressable>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  back: {
    minHeight: 48,
    justifyContent: "center",
    paddingRight: 12
  },
  link: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15
  },
  brand: {
    color: colors.accent,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1.8
  },
  title: {
    lineHeight: 44,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 36
  },
  intro: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 16,
    lineHeight: 26
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    gap: 18
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  badge: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 12,
    letterSpacing: 1.4
  },
  status: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 27,
    lineHeight: 36
  },
  description: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 23
  },
  button: {
    minHeight: 56,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    backgroundColor: colors.buttonPressed
  },
  buttonText: {
    color: colors.textOnPrimary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 16
  }
});
