import BackButton from '../../../components/BackButton';
import { useReducedMotion } from '../../../theme/useReducedMotion';
import { colors } from "../../../theme/colors";
import { useRecoveryFlow, recoveryErrorMessage } from "../context/RecoveryFlowContext";
import { useRouter, useFocusEffect } from "expo-router";

import React, { useCallback, useEffect, useRef, useState } from "react";

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
import { useFeedback, InlineFeedback } from "../../../notifications/useFeedback";

import ScreenContainer from "../../../components/ScreenContainer";

import RecoveryBackground from "../components/recovery/RecoveryBackground";
import RecoverySymbol from "../components/recovery/RecoverySymbol";

import styles from "../styles/forgotPassword.styles";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { feedback, validation, error: reportError, clearFeedback } = useFeedback();
  const { request, busy, clear } = useRecoveryFlow();
  useFocusEffect(useCallback(() => { clear(); }, [clear]));
    const { height } = useWindowDimensions();

    const compact = height < 760;
    const veryCompact = height < 680;

    const [email, setEmail] = useState("");
    const [focused, setFocused] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const fade = useRef(new Animated.Value(0)).current;
    const rise = useRef(new Animated.Value(12)).current;

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

    const cleanEmail = email.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    const handleContinue = async () => {
        clearFeedback();
        Keyboard.dismiss();
        if (!isValidEmail) { validation("Enter a valid registered email address."); return; }
        try {
            if (await request(cleanEmail)) router.navigate("/(public)/verify-reset-otp");
        } catch (error) { reportError("Unable to Request Code", recoveryErrorMessage(error)); }
    };

    return (
        <ScreenContainer padded={false}>
            <View style={styles.root}>
                {/* Abstract background */}
                <View
                    pointerEvents="none"
                    style={StyleSheet.absoluteFill}
                >
                    <RecoveryBackground />
                </View>

                <KeyboardAvoidingView
                    style={styles.keyboardContainer}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    {/* Content scrolls when the keyboard or a small screen limits height. */}
                    <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            styles.content,
                            compact && styles.contentCompact,
                            keyboardVisible && styles.contentKeyboard,
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <BackButton onPress={() => { clear(); router.replace("/(public)/login"); }} />

                            <Text style={styles.headerLabel}>
                                ACCOUNT RECOVERY
                            </Text>
                        </View>

                        {/* Main content */}
                        <Animated.View
                            style={[
                                styles.main,
                                {
                                    opacity: fade,
                                    transform: [{ translateY: rise }],
                                },
                            ]}
                        >
                            {!keyboardVisible && (
                                <View
                                    style={[
                                        styles.symbolWrap,
                                        veryCompact && styles.symbolCompact,
                                    ]}
                                >
                                    <RecoverySymbol />
                                </View>
                            )}

                            {!keyboardVisible && (
                                <Text style={styles.eyebrow}>
                                    HERE TO HELP YOU FIND YOUR WAY
                                </Text>
                            )}

                            <Text
                                style={[
                                    styles.title,
                                    keyboardVisible && styles.titleKeyboard,
                                ]}
                            >
                                Forgot your{"\n"}
                                <Text style={styles.titleAccent}>
                                    password?
                                </Text>
                            </Text>

                            {!keyboardVisible && (
                                <Text style={styles.description}>
                                    Enter your registered email address and we'll help you get back in.
                                </Text>
                            )}

                            {/* Mobile number input */}
                            <View
                                style={[
                                    styles.form,
                                    compact && styles.formCompact,
                                    keyboardVisible && styles.formKeyboard,
                                ]}
                            >
                                <Text style={styles.fieldLabel}>
                                    REGISTERED EMAIL ADDRESS
                                </Text>

                                <View
                                    style={[
                                        styles.inputWrap,
                                        focused && styles.inputFocused,
                                    ]}
                                >
                                    <TextInput keyboardAppearance="dark" selectionColor={colors.primary} underlineColorAndroid="transparent"
                                        value={email}
                                        onChangeText={setEmail}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        onFocus={() => setFocused(true)}
                                        onBlur={() => setFocused(false)}
                                        placeholder="you@example.com"
                                        placeholderTextColor={colors.textMuted}
                                        keyboardType="email-address"
                                        textContentType="emailAddress"
                                        autoComplete="email"
                                        maxLength={254}
                                        style={styles.input}
                                        accessibilityLabel="Registered email address"
                                    />

                                    {isValidEmail && (
                                        <View style={styles.validCircle}>
                                            <Text style={styles.validCheck}>
                                                ✓
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.helperRow}>
                                    <View style={styles.helperDot} />

                                    <Text style={styles.helperText}>
                                        If your account is eligible, we'll email a reset code.
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <InlineFeedback feedback={feedback} />
<Pressable
                                onPress={handleContinue}
                                disabled={!isValidEmail || busy}
                                accessibilityState={{ busy }}
                                accessibilityRole="button"
                                accessibilityLabel="Continue password recovery"
                                style={({ pressed }) => [
                                    styles.continueButton,
                                    !isValidEmail && styles.continueDisabled,
                                    pressed && isValidEmail && styles.continuePressed,
                                ]}
                            >
                                <Text style={[styles.continueText, (!isValidEmail || busy) && { color: colors.textMuted }]}>
                                    {busy ? "Requesting code..." : "Continue"}
                                </Text>

                                <View style={styles.arrowCircle}>
                                    <Text style={styles.arrowText}>
                                        →
                                    </Text>
                                </View>
                            </Pressable>

                            {!keyboardVisible && (
                                <>
                                    <Pressable
                                        onPress={() => { clear(); router.replace("/(public)/login"); }}
                                        style={styles.backToLogin}
                                        accessibilityRole="button"
                                        accessibilityLabel="Back to login"
                                    >
                                        <Text style={styles.backToLoginText}>
                                            ← Back to Log In
                                        </Text>
                                    </Pressable>

                                    <Text style={styles.footerNote}>
                                        YOUR JOURNEY IS STILL YOURS.
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
