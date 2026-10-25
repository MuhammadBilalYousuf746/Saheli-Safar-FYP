
import React, { useState } from "react";

import {
  Text,
  TextInput,
  View,
} from "react-native";

import styles from "../../styles/completeProfile.styles";

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  autoCapitalize = "none",
  secureTextEntry = false,
  rightAction,
  autoComplete,
  error,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>
        {label}
      </Text>

      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B4A7B3"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={styles.input}
          selectionColor="#552D50"
        />

        {rightAction}
      </View>

      {!!error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}
