
import React, { useEffect, useRef } from "react";

import {
  Alert,
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

export default function WelcomeScreen({ navigation }) {
  const { height, width } = useWindowDimensions();
  const compact = height < 740;

  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rise, {
        toValue: 0,
        duration: 750,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [fade, rise]);

  const handleRegister = () => {
    navigation.navigate("RegisterPhone");
  };

const handleLogin = () => {
  navigation.navigate("Login");
};

  return (
    <ScreenContainer>
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
          <View style={styles.headerSpacing} />
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
