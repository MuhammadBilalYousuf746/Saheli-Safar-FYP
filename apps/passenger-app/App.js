import { RecoveryFlowProvider } from "./src/features/auth/context/RecoveryFlowContext";

import React, { useEffect } from "react";
import { Appearance, Platform } from "react-native";
import { DarkTheme, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

import {
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

import { AuthSessionProvider } from "./src/features/auth/context/AuthSessionContext";
import LaunchExperience from "./src/features/onboarding/components/LaunchExperience";
import RootNavigator from "./src/navigation/RootNavigator";
import { colors } from "./src/theme/colors";
import { RegistrationFlowProvider } from "./src/features/auth/context/RegistrationFlowContext";
import NotificationProvider from "./src/notifications/NotificationProvider";

const midnightNavigationTheme = { ...DarkTheme, colors: { ...DarkTheme.colors,
  primary: colors.primary, background: colors.background, card: colors.surface,
  text: colors.textPrimary, border: colors.border, notification: colors.error,
} };

export default function App() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    Appearance.setColorScheme("dark");
    return () => Appearance.setColorScheme("unspecified");
  }, []);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  if (fontError) {
    throw fontError;
  }

  return (
    <ThemeProvider value={midnightNavigationTheme}>
    <SafeAreaProvider>
      <NotificationProvider>
      <AuthSessionProvider>
        <RegistrationFlowProvider>
        <StatusBar
          style="light"
        />
        <RecoveryFlowProvider>
          <LaunchExperience fontsReady={fontsLoaded}><RootNavigator /></LaunchExperience>
        </RecoveryFlowProvider>
        </RegistrationFlowProvider>
      </AuthSessionProvider>
      </NotificationProvider>
    </SafeAreaProvider>
    </ThemeProvider>
  );
}
