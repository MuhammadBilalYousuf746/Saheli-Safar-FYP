import React from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import PassengerBottomNavigation from '../../navigation/PassengerBottomNavigation';
import { colors } from '../../theme/colors';

export const unstable_settings = { initialRouteName: 'home' };

export default function PassengerLayout() {
  return <View style={{ flex: 1, backgroundColor: colors.background }}>
    <Stack initialRouteName="home" screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="bookings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="identity-verification" />
      <Stack.Screen name="emergency-contact" />
    </Stack>
    <PassengerBottomNavigation />
  </View>;
}
