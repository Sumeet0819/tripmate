import React from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-remix-icon";
import { useAppNavigation } from "../utils/navigation";
import { useTheme } from "../utils/theme";

const { height } = Dimensions.get("window");

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
  activeDotIndex?: number;
  totalDots?: number;
  onBackPress?: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = "Travel,\nsimplified.",
  subtitle = "Keep your plans, packing, and progress in one place.",
  activeDotIndex = 2,
  totalDots = 3,
  onBackPress,
}) => {
  const { colors, mode, toggleTheme, rounded } = useTheme();
  const navigation = useAppNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.back();
    }
  };

  return (
    <View 
      style={[
        styles.headerContainer,
        {
          backgroundColor: colors.primary,
          height: height * 0.46,
        },
      ]}
    >
      {/* Action Bar inside Card */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          onPress={handleBack}
          style={[
            styles.actionButton,
            {
              borderRadius: rounded.full,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            },
          ]}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left-line" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.actionButton,
            {
              borderRadius: rounded.full,
              backgroundColor: "rgba(255, 255, 255, 0.15)",
            },
          ]}
          activeOpacity={0.8}
        >
          <Icon 
            name={mode === "light" ? "moon-line" : "sun-line"} 
            size={18} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
      </View>

      {/* Typography Header Content */}
      <View style={styles.typographyContainer}>
        <Text 
          style={styles.titleText}
        >
          {title}
        </Text>
        <Text 
          style={styles.subtitleText}
        >
          {subtitle}
        </Text>
      </View>

      {/* Travel Simplified Graphic Art Overlay */}
      <View style={styles.graphicOverlay}>
        {/* Plane flying in sky */}
        <View style={styles.planeWrapper}>
          <Icon name="plane-fill" size={64} color="#FFFFFF" />
        </View>

        {/* Suitcase and Hat illustration */}
        <View style={styles.illustrationWrapper}>
          {/* Suitcase (Orange / Secondary Color) */}
          <View 
            style={[
              styles.suitcase,
              {
                backgroundColor: colors.secondary,
              },
            ]}
          >
            {/* Suitcase Handle */}
            <View 
              style={styles.suitcaseHandle}
            />
            {/* Stripes */}
            <View style={[styles.suitcaseStripe, { top: 32 }]} />
            <View style={[styles.suitcaseStripe, { top: 64 }]} />
            <View style={[styles.suitcaseStripe, { top: 96 }]} />
          </View>

          {/* Hat */}
          <View 
            style={styles.hat}
          >
            <View style={styles.hatInner} />
          </View>
        </View>
      </View>

      {/* Slider dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalDots }).map((_, idx) => {
          const isActive = idx === activeDotIndex;
          return (
            <View
              key={idx}
              style={[
                styles.dot,
                isActive ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
    position: "relative",
    overflow: "hidden",
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    justifyContent: "space-between",
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  typographyContainer: {
    marginTop: 16,
    zIndex: 10,
  },
  titleText: {
    fontFamily: "Montserrat",
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "800",
    letterSpacing: -1,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: "Inter",
    fontSize: 15,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.8)",
    maxWidth: 240,
    lineHeight: 22,
  },
  graphicOverlay: {
    position: "absolute",
    bottom: 16,
    right: 16,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  planeWrapper: {
    position: "absolute",
    top: -140,
    left: -150,
    opacity: 0.9,
    transform: [{ rotate: "60deg" }],
  },
  illustrationWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginRight: 8,
  },
  suitcase: {
    width: 96,
    height: 128,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    position: "relative",
  },
  suitcaseHandle: {
    width: 40,
    height: 16,
    position: "absolute",
    top: -16,
    left: 28,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderBottomWidth: 0,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  suitcaseStripe: {
    width: "100%",
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    position: "absolute",
  },
  hat: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "#F7F4E1",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    left: -24,
  },
  hatInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    backgroundColor: "rgba(146, 64, 14, 0.1)",
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 6,
    zIndex: 10,
    marginTop: 24,
  },
  dot: {
    height: 10,
    borderRadius: 5,
  },
  activeDot: {
    width: 24,
    backgroundColor: "#FFFFFF",
  },
  inactiveDot: {
    width: 10,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
}) as any;
