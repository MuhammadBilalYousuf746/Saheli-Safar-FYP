import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { layout, radius } from "../theme/spacing";

// Labeled dark text input with optional prefix, right action and error.
export default function TextField({
  label,
  error,
  hint,
  prefix,
  rightAction,
  style,
  ...inputProps
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.block, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        {!!prefix && (
          <>
            <Text style={styles.prefix}>{prefix}</Text>
            <View style={styles.separator} />
          </>
        )}

        <TextInput
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
          autoCorrect={false}
          {...inputProps}
          onFocus={(event) => {
            setFocused(true);
            inputProps.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            inputProps.onBlur?.(event);
          }}
          style={styles.input}
        />

        {rightAction}
      </View>

      {!!error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        !!hint && <Text style={styles.hint}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },

  label: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 11,
    letterSpacing: typography.letterSpacing.wide,
    color: colors.textSecondary,
  },

  inputWrap: {
    height: layout.inputHeight,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.input,
  },

  inputFocused: {
    borderColor: colors.borderFocus,
  },

  inputError: {
    borderColor: colors.error,
  },

  prefix: {
    fontFamily: typography.fontFamily.semibold,
    fontSize: 15,
    color: colors.primary,
  },

  separator: {
    width: 1,
    height: 24,
    marginHorizontal: 12,
    backgroundColor: colors.border,
  },

  input: {
    flex: 1,
    height: "100%",
    paddingVertical: 0,
    fontFamily: typography.fontFamily.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },

  error: {
    fontFamily: typography.fontFamily.medium,
    fontSize: 12,
    color: colors.error,
  },

  hint: {
    fontFamily: typography.fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
});
