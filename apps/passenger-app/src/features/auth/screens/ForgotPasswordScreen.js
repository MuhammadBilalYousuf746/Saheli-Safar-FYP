
import React, { useEffect, useRef, useState } from "react";

import {
    Animated,
    Easing,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    useWindowDimensions,
} from "react-native";
import { showAlert } from "../../../utils/alert";

import ScreenContainer from "../../../components/ScreenContainer";

import RecoveryBackground from "../components/recovery/RecoveryBackground";
import RecoverySymbol from "../components/recovery/RecoverySymbol";

import styles from "../styles/forgotPassword.styles";

export default function ForgotPasswordScreen({ navigation }) {
    const { height } = useWindowDimensions();

    const compact = height < 760;
    const veryCompact = height < 680;

    const [phone, setPhone] = useState("");
    const [focused, setFocused] = useState(false);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const fade = useRef(new Animated.Value(0)).current;
    const rise = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        const animation = Animated.parallel([
            Animated.timing(fade, {
                toValue: 1,
                duration: 480,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(rise, {
                toValue: 0,
                duration: 580,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]);

        animation.start();

        return () => animation.stop();
    }, [fade, rise]);

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

    const cleanPhone = phone.replace(/\D/g, "").slice(0, 10);
    const isValidPhone = /^3\d{9}$/.test(cleanPhone);

    const handleContinue = () => {
        Keyboard.dismiss();

        if (!isValidPhone) {
            showAlert(
                "Invalid Number",
                "Please enter a valid Pakistani mobile number."
            );
            return;
        }

        navigation.navigate("VerifyResetOTP", {
            phoneNumber: cleanPhone,
        });
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
                    {/* Fixed layout: no ScrollView */}
                    <View
                        style={[
                            styles.content,
                            compact && styles.contentCompact,
                            keyboardVisible && styles.contentKeyboard,
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Pressable
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                                accessibilityRole="button"
                                accessibilityLabel="Go back"
                            >
                                <Text style={styles.backArrow}>‹</Text>
                            </Pressable>

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
                                    No worries. Enter your registered mobile
                                    number and we'll help you get back in.
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
                                    REGISTERED MOBILE NUMBER
                                </Text>

                                <View
                                    style={[
                                        styles.inputWrap,
                                        focused && styles.inputFocused,
                                    ]}
                                >
                                    <View style={styles.countryCode}>
                                        <Text style={styles.flag}>🇵🇰</Text>
                                        <Text style={styles.codeText}>+92</Text>
                                    </View>

                                    <View style={styles.separator} />

                                    <TextInput
                                        value={phone}
                                        onChangeText={(value) =>
                                            setPhone(
                                                value.replace(/\D/g, "").slice(0, 10)
                                            )
                                        }
                                        onFocus={() => setFocused(true)}
                                        onBlur={() => setFocused(false)}
                                        placeholder="300 1234567"
                                        placeholderTextColor="#B4A7B3"
                                        keyboardType="phone-pad"
                                        textContentType="telephoneNumber"
                                        autoComplete="tel"
                                        maxLength={10}
                                        style={styles.input}
                                        accessibilityLabel="Registered mobile number"
                                    />

                                    {isValidPhone && (
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
                                        We'll send a verification code to this number.
                                    </Text>
                                </View>
                            </View>
                        </Animated.View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Pressable
                                onPress={handleContinue}
                                disabled={!isValidPhone}
                                accessibilityRole="button"
                                accessibilityLabel="Continue password recovery"
                                style={({ pressed }) => [
                                    styles.continueButton,
                                    !isValidPhone && styles.continueDisabled,
                                    pressed && isValidPhone && styles.continuePressed,
                                ]}
                            >
                                <Text style={styles.continueText}>
                                    Continue
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
                                        onPress={() => navigation.goBack()}
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
                    </View>
                </KeyboardAvoidingView>
            </View>
        </ScreenContainer>
    );
}
