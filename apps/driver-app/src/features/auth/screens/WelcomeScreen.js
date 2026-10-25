import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import logo from "../../../assets/images/logo-withoutbg.png";
import ScreenContainer from "../../../components/ScreenContainer";
import AppButton from "../../../components/AppButton";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { radius } from "../../../theme/spacing";

const BENEFITS = [
  {
    icon: "◆",
    title: "Women-only rides",
    text: "Drive women passengers across your city, safely.",
  },
  {
    icon: "◷",
    title: "Your schedule",
    text: "Go online when it suits you. No fixed shifts.",
  },
  {
    icon: "✓",
    title: "Verified community",
    text: "Every driver is checked by the Saheli Safar team.",
  },
];

export default function WelcomeScreen({ navigation }) {
  return (
    <ScreenContainer
      footer={
        <View style={styles.actions}>
          <AppButton
            title="Become a Saheli Driver"
            onPress={() => navigation.navigate("Register")}
          />
          <AppButton
            title="I already have an account"
            variant="secondary"
            onPress={() => navigation.navigate("Login")}
          />
        </View>
      }
    >
      <View style={styles.brandRow}>
        <View style={styles.logoPlate}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <View>
          <Text style={styles.brand}>Saheli Safar</Text>
          <Text style={styles.brandSub}>Driver App</Text>
        </View>
      </View>

      <LinearGradient
        colors={[colors.surfaceRaised, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <Text style={styles.eyebrow}>DRIVE WITH PURPOSE</Text>
        <Text style={styles.title}>
          Earn on your terms.{"\n"}
          <Text style={styles.titleAccent}>Drive with Saheli.</Text>
        </Text>
        <Text style={styles.description}>
          Join a trusted, verified network of drivers giving women a
          safer way to travel.
        </Text>

        <View style={styles.road}>
          {Array.from({ length: 7 }).map((_, index) => (
            <View key={index} style={styles.roadDash} />
          ))}
        </View>
      </LinearGradient>

      <View style={styles.benefits}>
        {BENEFITS.map((benefit) => (
          <View key={benefit.title} style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <Text style={styles.benefitIconText}>{benefit.icon}</Text>
            </View>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>{benefit.title}</Text>
              <Text style={styles.benefitBody}>{benefit.text}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logoPlate: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  logo: {
    width: 38,
    height: 38,
  },

  brand: {
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 18,
    color: colors.textPrimary,
  },

  brandSub: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.primary,
  },

  hero: {
    marginTop: 24,
    padding: 22,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },

  eyebrow: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: typography.letterSpacing.eyebrow,
    color: colors.primary,
  },

  title: {
    marginTop: 10,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 30,
    lineHeight: 37,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
  },

  titleAccent: {
    color: colors.primary,
  },

  description: {
    marginTop: 10,
    fontFamily: typography.fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },

  road: {
    marginTop: 22,
    height: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  roadDash: {
    width: 26,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    opacity: 0.6,
  },

  benefits: {
    marginTop: 20,
    gap: 12,
  },

  benefit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },

  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.tealSoft,
  },

  benefitIconText: {
    fontSize: 16,
    color: colors.teal,
  },

  benefitText: {
    flex: 1,
  },

  benefitTitle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },

  benefitBody: {
    marginTop: 2,
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  actions: {
    gap: 10,
  },
});
