import React, { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import logo from "../../../assets/images/logo-withoutbg.png";
import ScreenContainer from "../../../components/ScreenContainer";
import StepHeader from "../../../components/StepHeader";
import ScreenIntro from "../../../components/ScreenIntro";
import TextField from "../../../components/TextField";
import AppButton from "../../../components/AppButton";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { showAlert } from "../../../utils/alert";

import { loginDriver } from "../services/driver-auth.api";
import { saveDriverSession } from "../services/auth-session";
import { parseLoginIdentifier } from "../utils/validation";

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const credentials = parseLoginIdentifier(identifier);
  const canLogin = Boolean(credentials) && password.length > 0;

  const handleLogin = async () => {
    if (!canLogin || isLoggingIn) return;

    try {
      setIsLoggingIn(true);

      const response = await loginDriver({ ...credentials, password });

      await saveDriverSession({
        accessToken: response.accessToken,
        user: response.user,
      });

      setPassword("");
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      showAlert("Login Failed", error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <ScreenContainer
      footer={
        <View style={styles.footer}>
          <AppButton
            title="Log in"
            onPress={handleLogin}
            loading={isLoggingIn}
            disabled={!canLogin}
          />
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>New driver?</Text>
            <Pressable
              onPress={() => navigation.navigate("Register")}
              accessibilityRole="button"
            >
              <Text style={styles.registerLink}>Apply to drive</Text>
            </Pressable>
          </View>
        </View>
      }
    >
      <StepHeader onBack={() => navigation.goBack()} />

      <View style={styles.logoPlate}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
      </View>

      <ScreenIntro
        eyebrow="WELCOME BACK, DRIVER"
        title="Ready to"
        accent="drive?"
        description="Log in with the email or mobile number you registered with."
      />

      <View style={styles.form}>
        <TextField
          label="EMAIL OR MOBILE NUMBER"
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="you@example.com or 0300 1234567"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="username"
          textContentType="username"
        />

        <TextField
          label="PASSWORD"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoComplete="current-password"
          onSubmitEditing={handleLogin}
          rightAction={
            <Pressable
              onPress={() => setShowPassword((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              hitSlop={8}
            >
              <Text style={styles.toggle}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </Pressable>
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  logoPlate: {
    marginTop: 24,
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },

  logo: {
    width: 54,
    height: 54,
  },

  form: {
    gap: 18,
  },

  toggle: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.primary,
  },

  footer: {
    gap: 14,
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },

  registerPrompt: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },

  registerLink: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 13,
    color: colors.primary,
  },
});
