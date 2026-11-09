import { useReducedMotion } from '../../../theme/useReducedMotion';
import { colors } from "../../../theme/colors";
import { useRouter } from "expo-router";

import React, { useEffect, useRef, useState } from "react";

import {
    Animated,
    Easing,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";
import { notifications, safeFeedbackMessage } from "../../../notifications/notification-store";

import ScreenContainer from "../../../components/ScreenContainer";
import SaheliLoader from '../../../components/SaheliLoader';

import LoginBackground from "../components/login/LoginBackground";
import LoginArtwork from "../components/login/LoginArtwork";

import styles from "../styles/login.styles";

// Real Passenger Login API
import { useAuthSession } from "../context/AuthSessionContext";

// Secure authentication session


export default function LoginScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { signIn, cancelSignIn } = useAuthSession();
  useEffect(() => () => cancelSignIn(), [cancelSignIn]);
    const { height } = useWindowDimensions();

    const compact = height < 760;
    const veryCompact = height < 680;

    // Email address OR Pakistani mobile number.
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [phoneFocused, setPhoneFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState("");
    const loginInProgress = useRef(false);

    const fade = useRef(new Animated.Value(0)).current;
    const rise = useRef(new Animated.Value(12)).current;
    useEffect(() => { Keyboard.dismiss(); }, []);

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

    useEffect(() => {
        const show = Keyboard.addListener(
            Platform.OS === "ios"
                ? "keyboardWillShow"
                : "keyboardDidShow",
            () => setKeyboardVisible(true)
        );

        const hide = Keyboard.addListener(
            Platform.OS === "ios"
                ? "keyboardWillHide"
                : "keyboardDidHide",
            () => setKeyboardVisible(false)
        );

        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    // Detect whether the user typed an email or a phone number.
    const cleanIdentifier = identifier.trim();
    const isEmail = cleanIdentifier.includes("@");

    const loginEmail =
        isEmail &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier)
            ? cleanIdentifier.toLowerCase()
            : null;

    // Accepts 03001234567, 3001234567, +923001234567 or 923001234567.
    const phoneDigits = isEmail
        ? ""
        : cleanIdentifier.replace(/\D/g, "").replace(/^(92|0)/, "");

    const loginPhone = /^3\d{9}$/.test(phoneDigits)
        ? `+92${phoneDigits}`
        : null;

    const isValidIdentifier = Boolean(loginEmail || loginPhone);
    const canLogin = isValidIdentifier && password.length > 0;

    // ==========================================
    // REAL PASSENGER LOGIN + SECURE SESSION
    // ==========================================
    const handleLogin = async () => {
        if (loginInProgress.current) return;

        Keyboard.dismiss();
        setLoginError("");

        if (!canLogin) {
            setLoginError("Enter your email address or mobile number, and your password.");
            return;
        }

        try {
            loginInProgress.current = true;
            setIsLoggingIn(true);

            const accepted = await signIn({ email: loginEmail, phone: loginPhone, password });
            if (accepted) setPassword("");
        } catch (error) {
            const message = safeFeedbackMessage(error.message, "Unable to log in. Please try again.");
            setLoginError(message);
            notifications.notify({ type: "error", title: "Unable to Sign In", message });
        } finally {
            loginInProgress.current = false;
            setIsLoggingIn(false);
        }
    };

    const handleForgotPassword = () => {
        Keyboard.dismiss();
        router.navigate("/(public)/forgot-password");
    };

    return (
        <ScreenContainer padded={false}>
            <View style={styles.root}>
                {/* Background */}
                <View
                    pointerEvents="none"
                    style={StyleSheet.absoluteFill}
                >
                    <LoginBackground />
                </View>

                <KeyboardAvoidingView
                    style={styles.keyboardContainer}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.content,
                            compact && styles.contentCompact,
                            keyboardVisible && styles.contentKeyboard,
                        ]}
                    >
                        <View
                            style={[
                                styles.middle,
                                keyboardVisible && styles.middleKeyboard,
                            ]}
                        >
                            {/* Gateway illustration */}
                            {!keyboardVisible && (
                                <Animated.View
                                    style={[
                                        styles.artwork,
                                        compact && styles.artworkCompact,
                                        veryCompact && styles.artworkTiny,
                                        {
                                            opacity: fade,
                                            transform: [{ translateY: rise }],
                                        },
                                    ]}
                                >
                                    <LoginArtwork />
                                </Animated.View>
                            )}

                            {/* Heading */}
                            <Animated.View
                                style={[
                                    styles.intro,
                                    keyboardVisible && styles.introKeyboard,
                                    {
                                        opacity: fade,
                                        transform: [{ translateY: rise }],
                                    },
                                ]}
                            >
                                {!keyboardVisible && (
                                    <Text style={styles.eyebrow}>
                                        YOUR JOURNEY AWAITS
                                    </Text>
                                )}

                                <Text
                                    style={[
                                        styles.title,
                                        keyboardVisible && styles.titleKeyboard,
                                    ]}
                                >
                                    Welcome{" "}
                                    <Text style={styles.titleAccent}>
                                        back.
                                    </Text>
                                </Text>

                                {!keyboardVisible && (
                                    <Text style={styles.description}>
                                        Your familiar place, your next journey.
                                        Sign in and pick up where you left off.
                                    </Text>
                                )}
                            </Animated.View>

                            {/* Login form */}
                            <View
                                style={[
                                    styles.form,
                                    compact && styles.formCompact,
                                    keyboardVisible && styles.formKeyboard,
                                ]}
                            >
                                <Text style={styles.fieldLabel}>
                                    EMAIL OR MOBILE NUMBER
                                </Text>

                                <View
                                    style={[
                                        styles.inputWrap,
                                        phoneFocused && styles.inputFocused,
                                    ]}
                                >
                                    <TextInput keyboardAppearance="dark" selectionColor={colors.primary} underlineColorAndroid="transparent"
                                        value={identifier}
                                        onChangeText={setIdentifier}
                                        onFocus={() => setPhoneFocused(true)}
                                        onBlur={() => setPhoneFocused(false)}
                                        keyboardType="email-address"
                                        textContentType="username"
                                        autoComplete="username"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        placeholder="you@example.com or 0300 1234567"
                                        placeholderTextColor={colors.textMuted}
                                        maxLength={254}
                                        style={styles.input}
                                        accessibilityLabel="Email address or mobile number"
                                    />

                                    {isValidIdentifier && (
                                        <View style={styles.validCircle}>
                                            <Text style={styles.validCheck}>
                                                ✓
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.passwordHeader}>
                                    <Text style={styles.fieldLabel}>
                                        PASSWORD
                                    </Text>

                                    <Pressable
                                        onPress={handleForgotPassword}
                                        accessibilityRole="button"
                                        accessibilityLabel="Forgot password"
                                    >
                                        <Text style={styles.forgotText}>
                                            Forgot password?
                                        </Text>
                                    </Pressable>
                                </View>

                                <View
                                    style={[
                                        styles.inputWrap,
                                        passwordFocused && styles.inputFocused,
                                    ]}
                                >
                                    <TextInput keyboardAppearance="dark" selectionColor={colors.primary} underlineColorAndroid="transparent"
                                        value={password}
                                        onChangeText={setPassword}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        secureTextEntry={!showPassword}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        placeholderTextColor={colors.textMuted}
                                        style={styles.input}
                                        accessibilityLabel="Password"
                                    />

                                    <Pressable
                                        onPress={() =>
                                            setShowPassword((v) => !v)
                                        }
                                        style={styles.eyeButton}
                                        accessibilityRole="button"
                                        accessibilityLabel="Toggle password visibility"
                                    >
                                        <Text style={styles.eyeText}>
                                            {showPassword ? "Hide" : "Show"}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>

                        {/* Footer */}
                        <View
                            style={[
                                styles.footer,
                                keyboardVisible && styles.footerKeyboard,
                            ]}
                        >
                            {!!loginError && <Text accessibilityRole="alert" style={styles.error}>{loginError}</Text>}
                            <Pressable
                                onPress={handleLogin}
                                disabled={!canLogin || isLoggingIn}
                                accessibilityRole="button"
                                accessibilityLabel="Log in"
                                accessibilityState={{ busy: isLoggingIn }}
                                style={({ pressed }) => [
                                    styles.loginButton,
                                    !canLogin && styles.loginDisabled,
                                    pressed && canLogin && styles.loginPressed,
                                ]}
                            >
                                <Text style={[styles.loginText, (!canLogin || isLoggingIn) && { color: colors.textMuted }]}>
                                    Log In
                                </Text>

                                <View style={styles.arrowCircle}>
                                    {isLoggingIn ? <SaheliLoader mode="inline" color={colors.textOnPrimary} label="Signing in" /> : <Text style={styles.arrowText}>→</Text>}
                                </View>
                            </Pressable>

                            {!keyboardVisible && (
                                <>
                                    <View style={styles.registerRow}>
                                        <Text style={styles.registerPrompt}>
                                            New to Saheli Safar?
                                        </Text>

                                        <Pressable
                                            onPress={() =>
                                                router.navigate("/(public)/register")
                                            }
                                            accessibilityRole="button"
                                            accessibilityLabel="Create an account"
                                        >
                                            <Text style={styles.registerLink}>
                                                Create an account ↗
                                            </Text>
                                        </Pressable>
                                    </View>

                                    <Text style={styles.footerNote}>
                                        THE NEXT CHAPTER STARTS HERE.
                                    </Text>
                                </>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </ScreenContainer>
    );
}
