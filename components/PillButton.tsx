import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import Icon from "react-native-remix-icon";
import { useTheme } from "../utils/theme";

interface PillButtonProps {
  title: string;
  onPress: () => void;
  variant?: "white" | "primary" | "secondary" | "google" | "outline";
  icon?: string;
  iconColor?: string;
  disabled?: boolean;
}

export const PillButton: React.FC<PillButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  icon,
  iconColor,
  disabled = false,
}) => {
  const { colors, rounded } = useTheme();

  // Background and Border styles based on variant
  let bgStyle = {};
  let borderStyle = {};
  let textStyle = {
    color: "#FFFFFF",
    fontFamily: "Montserrat",
    fontSize: 15,
    fontWeight: "700" as const,
    letterSpacing: 0.5,
  };
  let resolvedIconColor = "#FFFFFF";

  if (variant === "white") {
    bgStyle = { backgroundColor: "#FFFFFF" };
    textStyle.color = "#121214";
    resolvedIconColor = "#121214";
  } else if (variant === "primary") {
    bgStyle = { backgroundColor: colors.primary };
  } else if (variant === "secondary") {
    bgStyle = { backgroundColor: colors.secondary };
  } else if (variant === "google") {
    bgStyle = { backgroundColor: colors.primaryContainer };
    borderStyle = { borderWidth: 1, borderColor: colors.outline };
    textStyle.color = colors.onSurface;
    resolvedIconColor = "#EA4335"; // Google Red
  } else if (variant === "outline") {
    bgStyle = { backgroundColor: "transparent" };
    borderStyle = { borderWidth: 1, borderColor: colors.outline };
    textStyle.color = colors.onSurface;
    resolvedIconColor = colors.onSurface;
  }

  if (iconColor) {
    resolvedIconColor = iconColor;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { borderRadius: rounded.full },
        bgStyle,
        borderStyle,
        disabled && styles.disabled,
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.contentContainer}>
        {icon && (
          <View style={styles.iconContainer}>
            <Icon name={icon as any} size={18} color={resolvedIconColor} />
          </View>
        )}
        <Text style={textStyle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 10,
  },
  disabled: {
    opacity: 0.5,
  },
});
