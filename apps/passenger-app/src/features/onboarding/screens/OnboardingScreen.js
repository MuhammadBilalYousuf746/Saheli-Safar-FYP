
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import ScreenContainer from "../../../components/ScreenContainer";
import OnboardingSlide from "../components/OnboardingSlide";
import { onboardingData } from "../data/onboardingData";

import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing, radius, layout } from "../../../theme/spacing";

function ProgressIndicator({ active }) {
  const progress = useRef(
    new Animated.Value(active ? 1 : 0)
  ).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: active ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    animation.start();

    return () => animation.stop();
  }, [active, progress]);

  const animatedWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 30],
  });

  const animatedColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.progressDot,
        {
          width: animatedWidth,
          backgroundColor: animatedColor,
        },
      ]}
    />
  );
}

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const buttonScale = useRef(new Animated.Value(1)).current;
  const slideOpacity = useRef(new Animated.Value(1)).current;
  const slideTranslate = useRef(new Animated.Value(0)).current;

  const currentSlide = onboardingData[currentIndex];
  const isLastSlide = currentIndex === onboardingData.length - 1;

  useEffect(() => {
    slideOpacity.setValue(0);
    slideTranslate.setValue(10);

    const animation = Animated.parallel([
      Animated.timing(slideOpacity, {
        toValue: 1,
        duration: 330,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideTranslate, {
        toValue: 0,
        duration: 330,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [currentIndex, slideOpacity, slideTranslate]);

const handleFinish = () => {
  navigation.replace("Welcome");
};

  const handleNext = () => {
    if (isLastSlide) {
      handleFinish();
      return;
    }

    setCurrentIndex((previous) => previous + 1);
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.975,
      speed: 35,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      speed: 25,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header — same position as before */}
        <View style={styles.header}>
          <Text style={styles.stepText}>
            {String(currentIndex + 1).padStart(2, "0")}
            {" / "}
            {String(onboardingData.length).padStart(2, "0")}
          </Text>

          {!isLastSlide ? (
            <Pressable
              onPress={handleFinish}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              hitSlop={8}
              style={({ pressed }) => [
                styles.skipButton,
                pressed && styles.skipPressed,
              ]}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          ) : (
            <View style={styles.skipPlaceholder} />
          )}
        </View>

        {/* Existing artwork and content — untouched */}
        <Animated.View
          style={[
            styles.slideContainer,
            {
              opacity: slideOpacity,
              transform: [{ translateY: slideTranslate }],
            },
          ]}
        >
          <OnboardingSlide
            key={currentSlide.id}
            eyebrow={currentSlide.eyebrow}
            title={currentSlide.title}
            description={currentSlide.description}
            illustration={currentSlide.illustration}
          />
        </Animated.View>

        {/* Footer — same layout dimensions */}
        <View style={styles.footer}>
          <View
            style={styles.progressContainer}
            accessibilityRole="text"
            accessibilityLabel={`Step ${currentIndex + 1} of ${onboardingData.length}`}
          >
            {onboardingData.map((slide, index) => (
              <ProgressIndicator
                key={slide.id}
                active={index === currentIndex}
              />
            ))}
          </View>

          <Animated.View
            style={{
              transform: [{ scale: buttonScale }],
            }}
          >
            <Pressable
              onPress={handleNext}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              accessibilityRole="button"
              accessibilityLabel={
                isLastSlide ? "Get Started" : "Next"
              }
              style={({ pressed }) => [
                styles.nextButton,
                pressed && styles.nextButtonPressed,
              ]}
            >
              <Text style={styles.nextButtonText}>
                {isLastSlide ? "Get Started" : "Next"}
              </Text>

              <View style={styles.arrowContainer}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    minHeight: 56,
  },

  stepText: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },

  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: radius.pill,
  },

  skipPlaceholder: {
    width: 56,
    height: 44,
  },

  skipPressed: {
    backgroundColor: colors.accentLight,
  },

  skipText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.sm,
  },

  slideContainer: {
    flex: 1,
    minHeight: 0,
  },

  footer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.lg,
    minHeight: 8,
  },

  progressDot: {
    height: 8,
    borderRadius: radius.pill,
  },

  nextButton: {
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
  },

  nextButtonPressed: {
    backgroundColor: colors.primaryDark,
  },

  nextButtonText: {
    color: colors.textOnPrimary,
    fontFamily: typography.fontFamily.semibold,
    fontSize: typography.fontSize.base,
  },

  arrowContainer: {
    position: "absolute",
    right: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  arrowText: {
    color: colors.textOnPrimary,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "400",
    includeFontPadding: false,
    transform: [{ translateY: -4 }],
  },
});
