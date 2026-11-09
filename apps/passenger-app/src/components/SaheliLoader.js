import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useReducedMotion } from '../theme/useReducedMotion';

// Trim only the source's empty top margin; preserve the untinted artwork.
export function SaheliLogo({ size = 84 }) {
  return <View style={{ width: size, height: size * 0.7, overflow: 'hidden' }}>
    <Image source={require('../assets/images/logo-withoutbg.png')} resizeMode="contain"
      accessibilityLabel="Saheli Safar logo" style={{ width: size, height: size, position: 'absolute', bottom: 0 }} />
  </View>;
}

export function SaheliSpinner({ size = 26, color = colors.primary, label = 'Loading content' }) {
  const reduced = useReducedMotion();
  const rotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    rotation.setValue(0);
    if (reduced) return;
    const animation = Animated.loop(Animated.timing(rotation, {
      toValue: 1, duration: 1000, easing: Easing.linear,
      useNativeDriver: Platform.OS !== 'web', isInteraction: false,
    }));
    animation.start();
    return () => { animation.stop(); rotation.stopAnimation(); };
  }, [reduced, rotation]);
  return <View testID="saheli-spinner" accessibilityRole="progressbar" accessibilityLabel={label}
    accessibilityState={{ busy: true }} aria-busy={true}
    {...(Platform.OS === 'web' ? { dataSet: { reducedMotion: String(reduced) } } : {})}>
    <Animated.View aria-hidden={true} style={{ width: size, height: size, borderRadius: size / 2,
      borderWidth: 2, borderColor: colors.border, borderTopColor: color, borderRightColor: color,
      transform: [{ rotate: rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }} />
  </View>;
}

// Mount only for real pending work. Inline actions have no logo or overlay.
export default function SaheliLoader({ mode = 'content', label = 'Loading content', showLabel = true, fontsReady = true, color }) {
  if (mode === 'inline') return <SaheliSpinner size={20} color={color} label={label} />;
  const Container = mode === 'fullscreen' ? SafeAreaView : View;
  return <Container testID="saheli-loader" style={[styles.content, mode === 'fullscreen' && styles.fullscreen]}
    {...(Platform.OS === 'web' ? { dataSet: { mode } } : {})}>
    <SaheliLogo /><SaheliSpinner label={label} />
    {showLabel && <Text style={[styles.label, fontsReady && { fontFamily: 'Inter_400Regular' }]}>{label}</Text>}
  </Container>;
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, minHeight: 190, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 14 },
  fullscreen: { flex: 1, backgroundColor: colors.background },
  label: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
