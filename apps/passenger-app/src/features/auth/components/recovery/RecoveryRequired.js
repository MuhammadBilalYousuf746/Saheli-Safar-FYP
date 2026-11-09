import React from 'react';
import { Text, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '../../../../components/ScreenContainer';
import { colors } from '../../../../theme/colors';

export default function RecoveryRequired() {
  const router = useRouter();
  return <ScreenContainer><View style={{ flex: 1, justifyContent: 'center', padding: 24, gap: 24 }}>
    <Text accessibilityRole="header" style={{ color: colors.textPrimary, fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 28 }}>Let’s start again.</Text>
    <Text accessibilityRole="alert" style={{ color: colors.textSecondary, fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 25 }}>Your recovery details are missing or expired. Request a new code to continue safely.</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Start password recovery" onPress={() => router.replace('/(public)/forgot-password')}>
      <Text style={{ color: colors.primary }}>Return to Forgot Password</Text>
    </Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to login" style={{ minHeight: 48, justifyContent: 'center' }} onPress={() => router.replace('/(public)/login')}><Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Back to Login</Text></Pressable>
  </View></ScreenContainer>;
}
