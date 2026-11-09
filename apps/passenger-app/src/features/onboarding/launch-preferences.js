import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Device-local presentation preferences only; separate from session storage.
const INTRO = 'saheli_safar_passenger_intro_v1';
const ONBOARDING = 'saheli_safar_passenger_onboarding_v1';
const read = key => Platform.OS === 'web' ? Promise.resolve(window.localStorage.getItem(key)) : SecureStore.getItemAsync(key);
const write = key => Platform.OS === 'web' ? Promise.resolve(window.localStorage.setItem(key, 'done')) : SecureStore.setItemAsync(key, 'done');
export async function readLaunchPreferences() {
  try {
    const [intro, onboarding] = await Promise.all([read(INTRO), read(ONBOARDING)]);
    return { introduced: intro === 'done', onboardingCompleted: onboarding === 'done' };
  } catch { return { introduced: false, onboardingCompleted: false }; }
}
export async function markIntroduced() { try { await write(INTRO); } catch { /* Navigation still works without storage. */ } }
export async function markOnboardingCompleted() { try { await write(ONBOARDING); } catch { /* Keep the current launch usable. */ } }
export const JOURNEY_TAGLINE = 'Ab har safar hogi with Saheli';
export function journeyGeometry(width, height) {
  const x = width * 0.78, y = height * 0.54;
  const radius = Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 2;
  const busWidth = Math.min(190, width * 0.48);
  return { x, y, radius, busWidth, busHeight: busWidth * 135 / 265, destination: Math.max(8, x - busWidth * 0.72) };
}
