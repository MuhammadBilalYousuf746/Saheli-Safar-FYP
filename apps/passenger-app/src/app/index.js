import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthSession } from '../features/auth/context/AuthSessionContext';
import SplashScreen from '../features/onboarding/screens/SplashScreen';

export default function EntryScreen() {
  const { showLogin } = useAuthSession();
  return showLogin ? <Redirect href="/(public)/login" /> : <SplashScreen />;
}
