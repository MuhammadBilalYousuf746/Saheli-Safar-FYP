import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { colors } from "../theme/colors";

import SplashScreen from "../features/onboarding/screens/SplashScreen";
import WelcomeScreen from "../features/auth/screens/WelcomeScreen";
import RegisterScreen from "../features/auth/screens/RegisterScreen";
import VerifyOTPScreen from "../features/auth/screens/VerifyOTPScreen";
import DocumentsScreen from "../features/auth/screens/DocumentsScreen";
import VehicleScreen from "../features/auth/screens/VehicleScreen";
import CreatePasswordScreen from "../features/auth/screens/CreatePasswordScreen";
import LoginScreen from "../features/auth/screens/LoginScreen";
import HomeScreen from "../features/home/screens/HomeScreen";

const Stack = createNativeStackNavigator();

// Registration: Register -> VerifyOTP -> Documents -> Vehicle -> CreatePassword
export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ animation: "fade" }}
      />
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{ animation: "fade" }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="Vehicle" component={VehicleScreen} />
      <Stack.Screen name="CreatePassword" component={CreatePasswordScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ animation: "fade" }}
      />
    </Stack.Navigator>
  );
}
