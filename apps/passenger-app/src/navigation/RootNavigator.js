import React from 'react';
import { Text, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthSession } from '../features/auth/context/AuthSessionContext';
import SaheliLoader from "../components/SaheliLoader";
import { colors } from '../theme/colors';

export default function RootNavigator() {
  const { status, message, retry, logout } = useAuthSession();
  if (status === 'initializing') return <SaheliLoader mode="fullscreen" label="Restoring your session..." />;
  if (status === 'unavailable') return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 20, backgroundColor: colors.background }}>
      <>
        <Text accessibilityRole="alert" style={{ color: colors.error, lineHeight: 24 }}>{message}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Retry session" onPress={retry}><Text style={{ color: colors.primary }}>Retry</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Sign in instead" onPress={logout}><Text style={{ color: colors.primary }}>Sign in instead</Text></Pressable>
      </>
    </SafeAreaView>
  );
  return <Stack key={status === 'authenticated' ? 'passenger' : 'public'} screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Protected guard={status !== 'authenticated'}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(public)" />
      </Stack.Protected>
      <Stack.Protected guard={status === 'authenticated'}>
        <Stack.Screen name="(passenger)" />
      </Stack.Protected>
    </Stack>;
}
