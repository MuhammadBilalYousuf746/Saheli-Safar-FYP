import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import * as NativeSplash from 'expo-splash-screen';
import { usePathname } from 'expo-router';
import Svg from 'react-native-svg';
import { colors } from '../../../theme/colors';
import { useMotionPreference } from '../../../theme/useReducedMotion';
import { useAuthSession } from '../../auth/context/AuthSessionContext';
import SaheliLoader, { SaheliLogo } from '../../../components/SaheliLoader';
import SaheliShuttle from './welcome/SaheliShuttle';
import IllustrationDefs from './welcome/IllustrationDefs';
import { JOURNEY_TAGLINE, journeyGeometry, markIntroduced, markOnboardingCompleted, readLaunchPreferences } from '../launch-preferences';

if (Platform.OS !== 'web') void NativeSplash.preventAutoHideAsync().catch(() => {});
const LaunchContext = createContext(null);
export const useLaunchPreferences = () => useContext(LaunchContext);

function SaheliJourney({ reduced, fontsReady, onComplete }) {
  const { width, height } = useWindowDimensions();
  const geometry = journeyGeometry(width, height);
  const bus = useRef(new Animated.Value(0)).current, circle = useRef(new Animated.Value(0)).current;
  const logo = useRef(new Animated.Value(0)).current, exit = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState('bus'), [letters, setLetters] = useState(0);
  useEffect(() => {
    let active = true, typing;
    const timing = (value, toValue, duration) => Animated.timing(value, { toValue, duration,
      easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    bus.setValue(0); circle.setValue(0); logo.setValue(0); exit.setValue(1); setLetters(0); setPhase('bus');
    if (reduced) { setLetters(JOURNEY_TAGLINE.length); setPhase('complete'); onComplete(); return; }
    const leave = timing(exit, 0, 180);
    const reveal = timing(logo, 1, 380), expand = timing(circle, 1, 600), travel = timing(bus, 1, 1000);
    travel.start(({ finished }) => {
      if (!active || !finished) return;
      setPhase('circle');
      expand.start(({ finished }) => {
        if (!active || !finished) return;
        setPhase('logo');
        reveal.start(({ finished }) => {
          if (!active || !finished) return;
          setPhase('typing'); let count = 0;
          typing = setInterval(() => {
            if (!active) return;
            setLetters(++count);
            if (count === JOURNEY_TAGLINE.length) {
              clearInterval(typing); setPhase('complete');
              leave.start(({ finished }) => { if (active && finished) onComplete(); });
            }
          }, 34);
        });
      });
    });
    return () => { active = false; clearInterval(typing); travel.stop(); expand.stop(); reveal.stop(); leave.stop(); };
  }, [reduced, width, height, bus, circle, logo, exit, onComplete]);
  const visibleText = reduced ? JOURNEY_TAGLINE : JOURNEY_TAGLINE.slice(0, letters);
  return <Animated.View testID="saheli-journey" style={[styles.journey, { opacity: exit }]}
    accessibilityLabel="Saheli Safar. Ab har safar hogi with Saheli"
    {...(Platform.OS === 'web' ? { dataSet: { phase } } : {})}>
    {!reduced && <>
      <Animated.View aria-hidden={true} style={[styles.route, { top: geometry.y, opacity: circle.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' }) }]} />
      <Animated.View testID="journey-bus" aria-hidden={true} style={{ position: 'absolute', top: geometry.y - geometry.busHeight * 0.88,
        opacity: circle.interpolate({ inputRange: [0, 0.4], outputRange: [1, 0], extrapolate: 'clamp' }),
        transform: [{ translateX: bus.interpolate({ inputRange: [0, 1], outputRange: [-geometry.busWidth, geometry.destination] }) }] }}>
        <Svg width={geometry.busWidth} height={geometry.busHeight} viewBox="45 140 265 135"><IllustrationDefs /><SaheliShuttle /></Svg>
      </Animated.View>
      <Animated.View testID="journey-circle" aria-hidden={true} style={[styles.circle, { left: geometry.x - 7, top: geometry.y - 7,
        opacity: logo.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
        transform: [{ scale: circle.interpolate({ inputRange: [0, 1], outputRange: [1, geometry.radius / 7] }) }] }]} />
    </>}
    <Animated.View style={[styles.reveal, { opacity: reduced ? 1 : logo,
      transform: [{ scale: reduced ? 1 : logo.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }] }]}>
      <SaheliLogo size={Math.min(220, width * 0.58, height * 0.48)} />
      {/* Reserve wrapping geometry; announce once rather than per character. */}
      <View style={styles.taglineFrame} aria-hidden={true}>
        <Text style={[styles.tagline, styles.measure, fontsReady && styles.taglineFont]}>{JOURNEY_TAGLINE}</Text>
        <Text testID="journey-tagline" style={[styles.tagline, styles.typed, fontsReady && styles.taglineFont]}>{visibleText}</Text>
      </View>
    </Animated.View>
  </Animated.View>;
}

// Presentation only: the existing session controller and protected Router
// remain the authorization and destination authorities.
export default function LaunchExperience({ children, fontsReady = true }) {
  const { status, showLogin } = useAuthSession();
  // Honor direct links promptly; the introduction belongs to the root launch.
  const initialPath = useRef(usePathname()).current;
  const motion = useMotionPreference();
  const [preferences, setPreferences] = useState(null), [mode, setMode] = useState('pending');
  const nativeFrameReady = useRef(false), finished = useRef(false);
  useEffect(() => {
    let active = true;
    void readLaunchPreferences().then(value => { if (active) setPreferences(value); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (mode !== 'pending' || !preferences || !motion.ready) return;
    setMode(initialPath !== '/' || preferences.introduced || preferences.onboardingCompleted || status === 'authenticated' || showLogin ? 'ready' : 'cinematic');
  }, [mode, preferences, motion.ready, status, showLogin, initialPath]);
  const complete = useCallback(() => {
    if (finished.current) return;
    finished.current = true; void markIntroduced(); setMode('ready');
  }, []);
  useEffect(() => {
    // A restored identity or an expired session takes precedence immediately.
    if (mode === 'cinematic' && (status === 'authenticated' || showLogin)) complete();
  }, [mode, status, showLogin, complete]);
  const completeOnboarding = useCallback(() => {
    setPreferences(previous => ({ ...previous, onboardingCompleted: true }));
    void markOnboardingCompleted();
  }, []);
  return <LaunchContext.Provider value={{ onboardingCompleted: !!preferences?.onboardingCompleted, completeOnboarding }}>
    <View style={styles.root} onLayout={() => {
      if (Platform.OS !== 'web' && !nativeFrameReady.current) { nativeFrameReady.current = true; NativeSplash.hide(); }
    }}>
      {mode === 'cinematic' ? <SaheliJourney reduced={motion.reduced} fontsReady={fontsReady} onComplete={complete} />
        : mode !== 'ready' || !fontsReady ? <SaheliLoader mode="fullscreen" fontsReady={fontsReady} label="Preparing your app..." /> : children}
    </View>
  </LaunchContext.Provider>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  journey: { flex: 1, overflow: 'hidden', backgroundColor: colors.background },
  route: { position: 'absolute', left: 24, right: 24, height: 1, backgroundColor: colors.primary },
  circle: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primaryDark },
  reveal: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 24 },
  taglineFrame: { width: '100%', maxWidth: 320 },
  tagline: { color: colors.textPrimary, fontSize: 17, lineHeight: 26, textAlign: 'center' },
  taglineFont: { fontFamily: 'Inter_500Medium' }, measure: { opacity: 0 }, typed: { position: 'absolute', top: 0, left: 0, right: 0 },
});
