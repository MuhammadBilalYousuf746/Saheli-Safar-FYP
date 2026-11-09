import { useReducedMotion } from '../theme/useReducedMotion';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Easing, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { notifications } from './notification-store';
import SaheliIcon from '../components/icons/SaheliIcon';
import { colors } from '../theme/colors';

const Context = createContext(notifications);
export const useNotifications = () => useContext(Context);
const variants = {
  success: { icon: 'check-circle', accent: colors.success },
  error: { icon: 'warning-circle', accent: colors.error },
  warning: { icon: 'warning-circle', accent: colors.warning },
  info: { icon: 'info', accent: colors.info },
};

function SignatureModal({ dialog, reduced }) {
  const [shown, setShown] = useState(dialog);
  const progress = useRef(new Animated.Value(0)).current;
  const initialButton = useRef(null), latest = useRef(dialog);
  const insets = useSafeAreaInsets();
  latest.current = dialog;
  // Retain the card for its reverse animation; newer dialogs cancel old exits.
  useEffect(() => {
    let active = true;
    progress.stopAnimation();
    if (dialog) { setShown(dialog); progress.setValue(0); }
    const animation = Animated.timing(progress, { toValue: dialog ? 1 : 0,
      duration: reduced ? 0 : dialog ? 200 : 160,
      easing: dialog ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web' });
    animation.start(({ finished }) => { if (active && finished && !latest.current) setShown(null); });
    return () => { active = false; animation.stop(); };
  }, [dialog?.id, progress, reduced]);
  useEffect(() => { if (dialog) setShown(dialog); }, [dialog]);
  useEffect(() => { if (dialog) Keyboard.dismiss(); }, [dialog?.id]);
  const focus = () => {
    if (Platform.OS === 'web') initialButton.current?.focus?.();
    else if (latest.current) AccessibilityInfo.announceForAccessibility(latest.current.title + '. ' + latest.current.message);
  };
  const tone = variants[shown?.type];
  const disabled = !dialog || dialog.id !== shown?.id || shown?.busy;
  return <Modal visible={!!shown} transparent animationType="none" hardwareAccelerated
    accessibilityLabel={shown?.title} onRequestClose={notifications.dismissDialog} onShow={focus}>
    <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]} />
      <View style={[styles.frame, { paddingTop: Math.max(24, insets.top), paddingBottom: Math.max(24, insets.bottom) }]}>
        <Animated.View testID="signature-modal" accessibilityViewIsModal
          {...(Platform.OS === 'web' ? { dataSet: { variant: shown?.type, reducedMotion: String(reduced) } } : {})}
          style={[styles.card, { opacity: progress, transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
          ] }]}>
          <View style={styles.content}>
            <View style={styles.heading}>
              {tone && <View style={styles.semanticIcon}><SaheliIcon name={tone.icon} size={18} color={tone.accent} /></View>}
              <Text accessibilityRole="header" style={styles.title}>{shown?.title}</Text>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.messageScroll} contentContainerStyle={styles.messageContent}>
              <Text style={styles.message}>{shown?.message}</Text>
              {!!shown?.error && <Text accessibilityRole="alert" style={styles.error}>{shown.error}</Text>}
            </ScrollView>
            <View style={styles.actions}>
              {shown?.type === 'confirmation' && <Pressable ref={initialButton} accessibilityRole="button"
                accessibilityLabel={shown.secondaryText} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={notifications.dismissDialog}
                style={({ pressed }) => [styles.button, styles.secondary, disabled && styles.disabled, pressed && styles.pressed]}>
                <Text style={styles.secondaryText}>{shown.secondaryText}</Text>
              </Pressable>}
              <Pressable ref={shown?.type === 'confirmation' ? undefined : initialButton} accessibilityRole="button"
                accessibilityLabel={shown?.primaryText} aria-busy={!!shown?.busy} accessibilityState={{ busy: !!shown?.busy, disabled: !!disabled }}
                disabled={disabled} onPress={notifications.acceptDialog}
                style={({ pressed }) => [styles.button, styles.primary, shown?.destructive && styles.destructive, disabled && styles.disabled, pressed && styles.pressed]}>
                {shown?.busy ? <ActivityIndicator color={shown?.destructive ? colors.error : colors.textOnPrimary} /> : <Text style={[styles.primaryText, shown?.destructive && styles.destructiveText]}>{shown?.primaryText}</Text>}
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
export default function NotificationProvider({ children }) {
  const [state, setState] = useState(notifications.getState);
  const reduced = useReducedMotion();
  useEffect(() => {
    const unsubscribe = notifications.subscribe(setState);
    return () => { unsubscribe(); notifications.clear(); };
  }, []);
  return <Context.Provider value={notifications}>
    <View style={styles.root}>{children}<SignatureModal dialog={state.dialog} reduced={reduced} /></View>
  </Context.Provider>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  overlay: { flex: 1 }, backdrop: { backgroundColor: colors.scrim },
  frame: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  card: {
    width: '100%', maxWidth: 340, maxHeight: '100%', backgroundColor: colors.surface,
    borderRadius: 20, borderWidth: 1, borderColor: colors.border,
    shadowColor: colors.shadow, shadowOpacity: 0.18, shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  content: { padding: 21, flexShrink: 1, minHeight: 0 },
  heading: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, flexShrink: 0 },
  semanticIcon: { paddingTop: 4 },
  title: { flex: 1, fontFamily: 'Inter_600SemiBold', color: colors.textPrimary, fontSize: 20, lineHeight: 27 },
  messageScroll: { marginTop: 9, flexGrow: 0, flexShrink: 1, minHeight: 0 },
  messageContent: { gap: 10 },
  message: { fontFamily: 'Inter_400Regular', color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  actions: { marginTop: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 10, flexShrink: 0 },
  button: {
    flexGrow: 1, flexBasis: 120, minWidth: 120, minHeight: 46, paddingHorizontal: 12, paddingVertical: 11,
    borderRadius: 13, borderWidth: 1, borderColor: 'transparent', justifyContent: 'center', alignItems: 'center',
  },
  primary: { backgroundColor: colors.primary },
  primaryText: { fontFamily: 'Inter_600SemiBold', color: colors.textOnPrimary, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  secondary: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  secondaryText: { fontFamily: 'Inter_600SemiBold', color: colors.textPrimary, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  destructive: { backgroundColor: colors.errorSurface, borderColor: colors.error },
  destructiveText: { color: colors.error },
  pressed: { opacity: 0.82 }, disabled: { opacity: 0.6 },
  error: { color: colors.error, fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 21 },
});
