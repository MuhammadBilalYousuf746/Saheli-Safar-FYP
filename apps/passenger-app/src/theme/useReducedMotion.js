import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

export function useMotionPreference() {
  const [preference, setPreference] = useState(() => Platform.OS === 'web' && typeof window !== 'undefined'
    ? { reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches, ready: true }
    : { reduced: true, ready: false });
  useEffect(() => {
    let active = true;
    if (Platform.OS === 'web') {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      const update = () => setPreference({ reduced: query.matches, ready: true }); update(); query.addEventListener?.('change', update);
      return () => query.removeEventListener?.('change', update);
    }
    AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setPreference({ reduced: value, ready: true }); })
      .catch(() => { if (active) setPreference({ reduced: true, ready: true }); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', value => setPreference({ reduced: value, ready: true }));
    return () => { active = false; subscription.remove(); };
  }, []);
  return preference;
}

export function useReducedMotion() { return useMotionPreference().reduced; }
