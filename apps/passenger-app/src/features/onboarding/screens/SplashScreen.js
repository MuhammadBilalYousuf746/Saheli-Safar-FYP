
import React, { useEffect, useRef } from "react";

import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import ScreenContainer from "../../../components/ScreenContainer";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";

export default function SplashScreen({ navigation }) {
  const { width, height } = useWindowDimensions();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.92)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),

        Animated.timing(logoScale, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    // Splash -> Onboarding
    const timer = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 3000);

    return () => {
      clearTimeout(timer);
      animation.stop();
    };
  }, [
    navigation,
    logoOpacity,
    logoScale,
    textOpacity,
  ]);

  return (
    <ScreenContainer padded={false}>
      <View style={styles.container}>
        {/* Subtle decorative background */}
        <View
          pointerEvents="none"
          style={styles.backgroundDecoration}
        >
          <View style={styles.topShape} />
          <View style={styles.bottomShape} />
        </View>

        {/* Center branding */}
        <View style={styles.centerContent}>
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <Image
              source={require(
                "../../../assets/images/logo-withoutbg.png"
              )}
              style={{
                width: Math.min(width * 0.58, 235),
                height: 170,
              }}
              resizeMode="contain"
              accessibilityLabel="Saheli Safar logo"
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.taglineContainer,
              { opacity: textOpacity },
            ]}
          >
            <View style={styles.taglineLine} />

            <Text style={styles.tagline}>
              YOUR JOURNEY, OUR CARE
            </Text>

            <View style={styles.taglineLine} />
          </Animated.View>
        </View>

        {/* Bottom branding */}
        <Animated.View
          style={[
            styles.bottomSection,
            { opacity: textOpacity },
          ]}
        >
          <View style={styles.loadingTrack}>
            <View style={styles.loadingFill} />
          </View>

          <Text style={styles.footerText}>
            Thoughtfully made for women in Karachi
          </Text>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  backgroundDecoration: {
    ...StyleSheet.absoluteFillObject,
  },

  topShape: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: "#F5E8EF",
    top: -175,
    right: -135,
    opacity: 0.65,
  },

  bottomShape: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#F3E9F4",
    bottom: -160,
    left: -120,
    opacity: 0.55,
  },

  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 35,
  },

  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: -3,
  },

  taglineLine: {
    width: 19,
    height: 1,
    backgroundColor: colors.accent,
    opacity: 0.7,
  },

  tagline: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 1.8,
    color: colors.primary,
    textAlign: "center",
  },

  bottomSection: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },

  loadingTrack: {
    width: 44,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#E7DCE6",
    overflow: "hidden",
    marginBottom: 18,
  },

  loadingFill: {
    width: "55%",
    height: "100%",
    borderRadius: 3,
    backgroundColor: colors.primaryLight,
  },

  footerText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 11,
    letterSpacing: 0.2,
    color: colors.textMuted,
    textAlign: "center",
  },
});
