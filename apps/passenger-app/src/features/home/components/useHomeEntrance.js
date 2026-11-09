import { useLayoutEffect, useRef } from "react";
import { Animated, Easing, Platform } from "react-native";
import { useAuthSession } from "../../auth/context/AuthSessionContext";
import { useMotionPreference } from "../../../theme/useReducedMotion";

export default function useHomeEntrance() {
  const { session, peekHomeEntrance, consumeHomeEntrance } = useAuthSession();
  const { reduced, ready } = useMotionPreference();
  const ticket = useRef(peekHomeEntrance(session)).current;
  const progress = useRef(new Animated.Value(ticket && !reduced ? 0 : 1)).current;
  const started = useRef(false);
  useLayoutEffect(() => {
    if (!ready || !ticket || started.current) return;
    started.current = true;
    if (consumeHomeEntrance(session) !== ticket || reduced) { progress.setValue(1); return; }
    progress.setValue(0);
    const animation = Animated.timing(progress, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== "web" });
    animation.start();
    return () => { animation.stop(); progress.setValue(1); };
  }, [ready, reduced, ticket, session, consumeHomeEntrance, progress]);
  // Keep readable content present from the first authenticated frame.
  return {
    entranceId: ticket,
    page: { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }) },
    hero: { transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] },
    supporting: { opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }), transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] },
  };
}
