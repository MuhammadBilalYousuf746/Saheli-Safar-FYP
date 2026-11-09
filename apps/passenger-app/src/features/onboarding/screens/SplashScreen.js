import React from "react";
import { Redirect } from "expo-router";
import { useLaunchPreferences } from '../components/LaunchExperience';

// Launch presentation finishes above the navigator. Session guards still own
// authenticated/expired destinations; this preference only skips onboarding.
export default function SplashScreen() {
  const { onboardingCompleted } = useLaunchPreferences();
  return <Redirect href={onboardingCompleted ? '/(public)/welcome' : '/(public)/onboarding'} />;
}
