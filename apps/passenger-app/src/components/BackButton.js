import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import SaheliIcon from './icons/SaheliIcon';

// Default preserves Login/Signup; authenticated callers opt into compact mode.
// Callers retain their own destination and navigation fallback policies.
export default function BackButton({ onPress, label = 'Go back', compact = false }) {
  return <Pressable testID="saheli-back-button" onPress={onPress}
    accessibilityRole="button" accessibilityLabel={label}
    style={({ pressed }) => [compact ? styles.touchTarget : styles.button, !compact && pressed && styles.pressed]}>
    {({ pressed }) => compact ? <View testID="back-button-surface" style={[styles.compactSurface, pressed && styles.pressed]}>
      <View style={styles.chevron}><SaheliIcon name="caret-right" size={20} color={colors.primaryLight} /></View>
    </View> : <Text style={styles.arrow}>‹</Text>}
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.surface,
    borderColor: colors.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pressed: { backgroundColor: colors.surfaceAlt },
  arrow: { fontSize: 32, lineHeight: 37, marginTop: -3, color: colors.primary },
  touchTarget: { width: 44, height: 44, borderRadius: 13, borderWidth: 0, alignItems: 'center', justifyContent: 'center' },
  compactSurface: { width: 38, height: 38, borderRadius: 13, borderWidth: 0, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  chevron: { transform: [{ rotate: '180deg' }] },
});
