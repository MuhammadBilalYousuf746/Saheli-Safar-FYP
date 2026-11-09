import { useReducedMotion } from '../../../theme/useReducedMotion';
import { useRouter } from "expo-router";

import React, { useEffect, useRef } from "react";

import {
  Platform,
  Animated,
  Easing,
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import ScreenContainer from "../../../components/ScreenContainer";
import WelcomeIllustration from "../../onboarding/components/welcome/WelcomeIllustration";

import styles from "../styles/welcome.styles";

export default function WelcomeScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { height, width } = useWindowDimensions();
  const compact = height < 740;

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: reducedMotion ? 0 : 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: reducedMotion ? 0 : 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [fade, rise, reducedMotion]);

  const handleRegister = () => {
    router.navigate("/(public)/register");
  };

const handleLogin = () => {
  router.navigate("/(public)/login");
};

  return (
    <ScreenContainer scrollable>
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.header}>
          <Image
            source={require("../../../assets/images/logo-withoutbg.png")}
            style={[
              styles.logo,
              { width: Math.min(width * 0.39, 170) },
            ]}
            resizeMode="contain"
            accessibilityLabel="Saheli Safar logo"
          />
          <Text style={styles.brandWordmark}>SAHELI SAFAR</Text>
        </View>

        {/* Illustration */}
        <Animated.View
          style={[
            styles.artworkSection,
            compact && styles.artworkCompact,
            {
              opacity: fade,
              transform: [{ translateY: rise }],
            },
          ]}
        >
          <WelcomeIllustration />
        </Animated.View>

        {/* Heading and description */}
        <Animated.View
          style={[
            styles.messageSection,
            {
              opacity: fade,
              transform: [{ translateY: rise }],
            },
          ]}
        >
          <Text
            style={[
              styles.title,
              compact && styles.titleCompact,
            ]}
          >
            Your city.{"\n"}
            <Text style={styles.titleAccent}>
              Your journey.
            </Text>
          </Text>

          <Text style={styles.description}>
            A thoughtfully designed way to plan
            your everyday commute across Karachi.
          </Text>

          <View style={styles.dividerSpacing} />
        </Animated.View>

        {/* Buttons */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleRegister}
            accessibilityRole="button"
            accessibilityLabel="Create an account"
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              Create an Account
            </Text>

            <Text style={styles.primaryArrow}>→</Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel="Log in to your account"
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>
              I Already Have an Account
            </Text>
          </Pressable>

          <View style={styles.footerCaptionSpacing} />
        </View>

      </View>
    </ScreenContainer>
  );
}
