import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-remix-icon";
import { useTheme } from "../utils/theme";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  percent: string;
  isPositive: boolean;
  icon: string;
  iconColor: string;
  circleBg: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  percent,
  isPositive,
  icon,
  iconColor,
  circleBg,
}) => {
  const { mode } = useTheme();

  return (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: mode === "light" ? "#FFFFFF" : "#1A1D23",
        },
      ]}
    >
      {/* Overlapping Top Right Pill Icon (Double Circle Mockup cut-out style) */}
      <View
        style={[
          styles.outerCircle,
          {
            backgroundColor: mode === "light" ? "#FFFFFF" : "#1A1D23", // Matches card background
            borderColor: mode === "light" ? "#EFF2EE" : "#0E1013", // Masks against light/dark page background
          },
        ]}
      >
        <View
          style={[
            styles.innerCircle,
            {
              backgroundColor: circleBg,
            },
          ]}
        >
          <Icon name={icon as any} size={14} color={iconColor} />
        </View>
      </View>

      {/* Card Title & Info Icon */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.titleText,
            {
              color: mode === "light" ? "#5E6573" : "#8C93A3",
            },
          ]}
        >
          {title}
        </Text>
        <Icon
          name="information-line"
          size={11}
          color={mode === "light" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)"}
        />
      </View>

      {/* Big Metric Value */}
      <Text
        style={[
          styles.valueText,
          {
            color: mode === "light" ? "#072D1B" : "#FFFFFF",
          },
        ]}
      >
        {value}
      </Text>

      {/* Subtitle Change Info */}
      <Text
        style={[
          styles.subtitleText,
          {
            color: mode === "light" ? "#8C93A3" : "#5E6573",
          },
        ]}
      >
        {change}
      </Text>

      {/* Bottom Trend Badge Indicator */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: isPositive
              ? mode === "light" ? "#D1FAE5" : "#064E3B"
              : mode === "light" ? "#FCE7F3" : "#4D1234",
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color: isPositive
                ? mode === "light" ? "#065F46" : "#34D399"
                : mode === "light" ? "#9D174D" : "#F472B6",
            },
          ]}
        >
          {percent}
        </Text>
        <Icon
          name={isPositive ? "arrow-right-up-line" : "arrow-right-down-line"}
          size={10}
          color={
            isPositive
              ? mode === "light" ? "#065F46" : "#34D399"
              : mode === "light" ? "#9D174D" : "#F472B6"
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 20,
    borderRadius: 16,
    position: "relative",
    width: "48%",
  },
  outerCircle: {
    position: "absolute",
    top: -12,
    right: -6,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3.5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  innerCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingRight: 24,
  },
  titleText: {
    fontFamily: "Inter",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginRight: 4,
    textTransform: "uppercase",
  },
  valueText: {
    fontFamily: "Montserrat",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitleText: {
    fontFamily: "Inter",
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
    marginBottom: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  badgeText: {
    fontFamily: "Inter",
    fontSize: 9,
    fontWeight: "800",
    marginRight: 2,
  },
});
