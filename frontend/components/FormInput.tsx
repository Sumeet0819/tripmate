import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from "react-native";
import Icon from "react-native-remix-icon";
import { useTheme } from "../utils/theme";

interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  maxLength?: number;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  maxLength,
}) => {
  const { colors, rounded } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {/* Upper Label */}
      <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>{label.toUpperCase()}</Text>

      {/* Input Field Container */}
      <View
        style={[
          styles.inputWrapper,
          {
            borderRadius: rounded.full,
            borderColor: isFocused ? colors.primary : colors.outline,
            backgroundColor: colors.primaryContainer,
          },
        ]}
      >
        {/* Left Icon Prefix */}
        <Icon name={icon as any} size={18} color={colors.onSurfaceVariant} />

        {/* Text Input */}
        <TextInput
          style={[styles.input, { color: colors.onSurface }]}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          autoCorrect={false}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontFamily: "Inter",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 12,
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "400",
  },
});
