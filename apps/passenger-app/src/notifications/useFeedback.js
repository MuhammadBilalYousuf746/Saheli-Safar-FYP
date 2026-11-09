import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { notifications, safeFeedbackMessage } from './notification-store';
import { colors } from '../theme/colors';

// Keep field validation and intermediate steps inline, with persistent failures.
export function useFeedback() {
  const [feedback, setFeedback] = useState(null);
  const inline = message => setFeedback({ message: safeFeedbackMessage(message), tone: 'info' });
  const validation = message => setFeedback({ message: safeFeedbackMessage(message), tone: 'error' });
  const error = (title, message) => {
    const copy = safeFeedbackMessage(message); setFeedback({ message: copy, tone: 'error' });
    notifications.notify({ type: 'error', title, message: copy });
  };
  const success = (title, message) => notifications.notify({ type: 'success', title, message });
  return { feedback, inline, validation, error, success, clearFeedback: () => setFeedback(null) };
}
export function InlineFeedback({ feedback }) {
  return feedback ? <Text accessibilityRole={feedback.tone === 'error' ? 'alert' : undefined}
    accessibilityLiveRegion="polite" style={[styles.copy, feedback.tone === 'error' && styles.error]}>{feedback.message}</Text> : null;
}
const styles = StyleSheet.create({ copy: { color: colors.primaryLight, fontSize: 14, lineHeight: 20, marginVertical: 8 }, error: { color: colors.error } });
