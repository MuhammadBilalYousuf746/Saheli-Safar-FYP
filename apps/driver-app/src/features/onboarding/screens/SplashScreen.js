import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import logo from "../../../assets/images/logo-withoutbg.png";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { getDriverSession } from "../../auth/services/auth-session";

const MIN_SPLASH_MS = 1400;

export default function SplashScreen({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    let cancelled = false;

    // Signed-in drivers go straight to Home.
    Promise.all([
      getDriverSession().catch(() => null),
      new Promise((resolve) => setTimeout(resolve, MIN_SPLASH_MS)),
    ]).then(([session]) => {
      if (cancelled) return;

      navigation.reset({
        index: 0,
        routes: [{ name: session ? "Home" : "Welcome" }],
      });
    });

    return () => {
      cancelled = true;
      animation.stop();
    };
  }, [navigation, opacity, scale]);

  return (
    <SafeAreaView style={styles.container}>
      <View pointerEvents="none" style={styles.glow} />

      <Animated.View
        style={[styles.center, { opacity, transform: [{ scale }] }]}
      >
        <View style={styles.logoPlate}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>Saheli Safar</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>DRIVER</Text>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.footer, { opacity }]}>
        DRIVE SAFE. DRIVE WITH PRIDE.
      </Animated.Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  glow: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: colors.primarySoft,
  },

  center: {
    alignItems: "center",
  },

  logoPlate: {
    width: 148,
    height: 148,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  logo: {
    width: 124,
    height: 124,
  },

  title: {
    marginTop: 22,
    fontFamily: typography.fontFamily.displayBold,
    fontSize: 30,
    letterSpacing: typography.letterSpacing.tight,
    color: colors.textPrimary,
  },

  badge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },

  badgeText: {
    fontFamily: typography.fontFamily.bold,
    fontSize: 11,
    letterSpacing: 3,
    color: colors.onPrimary,
  },

  footer: {
    position: "absolute",
    bottom: 40,
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: typography.letterSpacing.eyebrow,
    color: colors.textMuted,
  },
});
