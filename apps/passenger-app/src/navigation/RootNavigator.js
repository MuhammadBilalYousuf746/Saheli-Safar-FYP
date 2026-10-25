
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../features/onboarding/screens/SplashScreen";
import OnboardingScreen from "../features/onboarding/screens/OnboardingScreen";

import WelcomeScreen from "../features/auth/screens/WelcomeScreen";
import RegisterPhoneScreen from "../features/auth/screens/RegisterPhoneScreen";
import VerifyOTPScreen from "../features/auth/screens/VerifyOTPScreen";
import CompleteProfileScreen from "../features/auth/screens/CompleteProfileScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import ForgotPasswordScreen from "../features/auth/screens/ForgotPasswordScreen";
import VerifyResetOTPScreen from "../features/auth/screens/VerifyResetOTPScreen";
import CreateNewPasswordScreen from "../features/auth/screens/CreateNewPasswordScreen";
import HomeDashboardScreen from "../features/home/screens/HomeDashboardScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
      />

      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
      />

      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
      />

      <Stack.Screen
        name="RegisterPhone"
        component={RegisterPhoneScreen}
      />

      <Stack.Screen
        name="VerifyOTP"
        component={VerifyOTPScreen}
      />

      <Stack.Screen
        name="CompleteProfile"
        component={CompleteProfileScreen}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />

      <Stack.Screen
        name="VerifyResetOTP"
        component={VerifyResetOTPScreen}
      />

      <Stack.Screen
        name="CreateNewPassword"
        component={CreateNewPasswordScreen}
      />

      <Stack.Screen
  name="HomeDashboard"
  component={HomeDashboardScreen}
/>
    </Stack.Navigator>
  );
}
