import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-remix-icon";
import Svg, { Path, Defs, Pattern, Line, Circle, Text as SvgText } from "react-native-svg";
import { useTheme } from "../utils/theme";

const { width } = Dimensions.get("window");

// High Fidelity Analytics Chart SVG Component with Dynamic Stripes
const AnalyticsChart = ({ mode }: { mode: "light" | "dark" }) => {
  const { colors } = useTheme();
  const chartWidth = width - 48; // Padding px-6 on both sides = 48
  const chartHeight = 160;

  // Colors based on theme
  const strokeColor = colors.primary; // Dynamic Travel Blue
  const verticalLineColor = colors.secondary; // Premium Orange focus line
  const labelColor = colors.onSurfaceVariant;
  const gridLineColor = mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)";

  return (
    <View style={{ width: "100%", height: chartHeight, marginTop: 16 }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <Defs>
          {/* Diagonal Stripes Pattern Definition using theme primary */}
          <Pattern
            id="themeStripes"
            width={12}
            height={12}
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <Line
              x1={0}
              y1={0}
              x2={0}
              y2={12}
              stroke={colors.primary}
              strokeWidth={3.5}
              opacity={0.15}
            />
          </Pattern>
        </Defs>

        {/* Horizontal grid guide lines */}
        <Line x1={32} y1={20} x2={chartWidth} y2={20} stroke={gridLineColor} strokeWidth={1} />
        <Line x1={32} y1={75} x2={chartWidth} y2={75} stroke={gridLineColor} strokeWidth={1} />
        <Line x1={32} y1={130} x2={chartWidth} y2={130} stroke={gridLineColor} strokeWidth={1} />

        {/* Y Axis Labels */}
        <SvgText x={24} y={24} fill={labelColor} fontSize={10} fontWeight="600" textAnchor="end">
          1.0%
        </SvgText>
        <SvgText x={24} y={79} fill={labelColor} fontSize={10} fontWeight="600" textAnchor="end">
          0.8%
        </SvgText>
        <SvgText x={24} y={134} fill={labelColor} fontSize={10} fontWeight="600" textAnchor="end">
          0.4%
        </SvgText>

        {/* Beautiful Shaded Area filled with Diagonal Stripes */}
        <Path
          d={`
            M 45,95 
            C 75,95 85,85 110,85 
            C 135,85 145,55 175,55 
            C 205,55 215,53 240,53 
            C 265,53 275,30 305,30 
            C 335,30 340,15 350,15
            L 350,55 
            C 340,55 335,70 305,70
            C 275,70 265,95 240,95
            C 215,95 205,115 175,115
            C 145,115 135,110 110,110
            C 85,110 75,115 45,115 
            Z
          `}
          fill="url(#themeStripes)"
        />

        {/* Top Boundary Line */}
        <Path
          d="M 45,95 C 75,95 85,85 110,85 C 135,85 145,55 175,55 C 205,55 215,53 240,53 C 265,53 275,30 305,30 C 335,30 340,15 350,15"
          fill="none"
          stroke={strokeColor}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Bottom Boundary Line */}
        <Path
          d="M 45,115 C 75,115 85,110 110,110 C 135,110 145,115 175,115 C 205,115 215,95 240,95 C 265,95 275,70 305,70 C 335,70 340,55 350,55"
          fill="none"
          stroke={strokeColor}
          strokeWidth={3}
          strokeLinecap="round"
        />

        {/* Data points (Dots) on Top Line */}
        <Circle cx={45} cy={95} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />
        <Circle cx={110} cy={85} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />
        <Circle cx={175} cy={55} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />
        <Circle cx={240} cy={53} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />
        <Circle cx={305} cy={30} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />
        <Circle cx={350} cy={15} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />

        {/* Data points (Dots) on Bottom Line */}
        <Circle cx={45} cy={115} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />
        <Circle cx={110} cy={110} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />
        <Circle cx={175} cy={115} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />
        <Circle cx={240} cy={95} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />
        <Circle cx={305} cy={70} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />
        <Circle cx={350} cy={55} r={4.5} fill="#FFFFFF" stroke={strokeColor} strokeWidth={2.5} />

        {/* Signature Vertical Line Marker at 'Apr' (x=240) */}
        <Line x1={240} y1={53} x2={240} y2={95} stroke={verticalLineColor} strokeWidth={2.5} />
        {/* Dark Green Center Circle */}
        <Circle cx={240} cy={74} r={14} fill={verticalLineColor} />
        {/* White Percentage Label inside Circle */}
        <SvgText x={240} y={78} fill="#FFFFFF" fontSize={9} fontWeight="bold" textAnchor="middle">
          34%
        </SvgText>

        {/* X Axis Labels */}
        <SvgText
          x={45}
          y={155}
          fill={labelColor}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          Jan
        </SvgText>
        <SvgText
          x={110}
          y={155}
          fill={labelColor}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          Feb
        </SvgText>
        <SvgText
          x={175}
          y={155}
          fill={labelColor}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          Mar
        </SvgText>
        <SvgText
          x={240}
          y={155}
          fill={labelColor}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          Apr
        </SvgText>
        <SvgText
          x={305}
          y={155}
          fill={labelColor}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          May
        </SvgText>
        <SvgText
          x={350}
          y={155}
          fill={labelColor}
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          Jun
        </SvgText>
      </Svg>
    </View>
  );
};

interface AnalyticsChartCardProps {
  title: string;
  rateValue?: string;
  ratePercent?: string;
  deliveryValue?: string;
  deliveryPercent?: string;
  onFilterPress?: () => void;
  onMorePress?: () => void;
}

export const AnalyticsChartCard: React.FC<AnalyticsChartCardProps> = ({
  title,
  rateValue = "0.78%",
  ratePercent = "16%",
  deliveryValue = "4,652",
  deliveryPercent = "0.6%",
  onFilterPress,
  onMorePress,
}) => {
  const { colors, mode } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
        },
      ]}
    >
      {/* Header row: title and dropdown filter options */}
      <View style={styles.cardHeader}>
        <Text
          style={[
            styles.titleText,
            {
              color: colors.onSurface,
            },
          ]}
        >
          {title}
        </Text>

        {/* Action buttons matching mockup structure */}
        <View style={styles.actionsContainer}>
          {/* 1. Monthly Filter */}
          <TouchableOpacity
            style={[
              styles.pillFilter,
              {
                borderColor: colors.outline,
              },
            ]}
            onPress={onFilterPress}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: colors.onSurface,
                },
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>

          {/* 2. Trips Dropdown Filter */}
          <TouchableOpacity
            style={[
              styles.pillFilter,
              {
                borderColor: colors.outline,
              },
            ]}
            onPress={onFilterPress}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: colors.onSurface,
                  marginRight: 2,
                },
              ]}
            >
              Trips
            </Text>
            <Icon name="arrow-down-s-line" size={10} color={colors.onSurface} />
          </TouchableOpacity>

          {/* 3. Triple Dots More Button */}
          <TouchableOpacity
            style={[
              styles.moreButton,
              {
                borderColor: colors.outline,
              },
            ]}
            onPress={onMorePress}
            activeOpacity={0.7}
          >
            <Icon name="more-fill" size={10} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics under the title */}
      <View
        style={[
          styles.metricsRow,
          {
            borderBottomColor: colors.outline,
          },
        ]}
      >
        {/* Rate Metrics */}
        <View style={styles.metricWrapper}>
          <Text
            style={[
              styles.metricLabel,
              {
                color: colors.onSurfaceVariant,
              },
            ]}
          >
            Rate
          </Text>
          <Text
            style={[
              styles.metricValue,
              {
                color: colors.onSurface,
              },
            ]}
          >
            {rateValue}
          </Text>
          {/* Circular Up Arrow Badge */}
          <View style={[styles.arrowCircle, { backgroundColor: "#047857" }]}>
            <Icon name="arrow-up-line" size={9} color="#FFFFFF" />
          </View>
          <Text
            style={[
              styles.metricPercent,
              {
                color: colors.onSurfaceVariant,
              },
            ]}
          >
            {ratePercent}
          </Text>
        </View>

        {/* Delivery Metrics */}
        <View style={styles.metricWrapper}>
          <Text
            style={[
              styles.metricLabel,
              {
                color: colors.onSurfaceVariant,
              },
            ]}
          >
            Delivery
          </Text>
          <Text
            style={[
              styles.metricValue,
              {
                color: colors.onSurface,
              },
            ]}
          >
            {deliveryValue}
          </Text>
          {/* Circular Down Arrow Badge */}
          <View style={[styles.arrowCircle, { backgroundColor: "#E11D48" }]}>
            <Icon name="arrow-down-line" size={9} color="#FFFFFF" />
          </View>
          <Text
            style={[
              styles.metricPercent,
              {
                color: colors.onSurfaceVariant,
              },
            ]}
          >
            {deliveryPercent}
          </Text>
        </View>
      </View>

      {/* Custom High-Fidelity Stripe Filled Chart */}
      <AnalyticsChart mode={mode} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleText: {
    fontFamily: "Montserrat",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillFilter: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  filterText: {
    fontFamily: "Inter",
    fontSize: 9,
    fontWeight: "700",
  },
  moreButton: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 24,
    marginTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  metricWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  metricLabel: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600",
  },
  metricValue: {
    fontFamily: "Montserrat",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 6,
  },
  arrowCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  metricPercent: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
});
