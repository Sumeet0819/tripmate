import React from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import Icon from "react-native-remix-icon";
import { useTheme } from "../utils/theme";

const { width } = Dimensions.get("window");

interface TripData {
  id: string;
  title: string;
  location: string;
  duration: string;
  price: string;
  slotsLeft: string;
  category: string;
  image: string;
}

interface FeaturedTripCardProps {
  trip: TripData;
}

export const FeaturedTripCard: React.FC<FeaturedTripCardProps> = ({ trip }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.featuredCard, { backgroundColor: colors.surface }]}>
      {/* Background Image */}
      <Image 
        source={{ uri: trip.image }} 
        style={styles.featuredImage} 
        resizeMode="cover"
      />
      {/* Subtle overlay for balanced contrast */}
      <View style={styles.vignetteOverlay} />

      {/* Top Left: Minimal Category Badge */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryBadgeText}>{trip.category}</Text>
      </View>

      {/* Top Right: Glassmorphic Duration Badge */}
      <View style={styles.durationBadge}>
        <Text style={styles.durationBadgeText}>{trip.duration.toUpperCase()}</Text>
      </View>

      {/* Bottom: Floating Glassmorphic Info Plate */}
      <View style={styles.glassPlate}>
        {/* Left column: Title & Location */}
        <View style={styles.leftColumn}>
          <Text style={styles.titleText} numberOfLines={1}>
            {trip.title}
          </Text>
          <View style={styles.locationRow}>
            <Icon name="map-pin-2-fill" size={10} color="rgba(255,255,255,0.7)" />
            <Text style={styles.locationText} numberOfLines={1}>
              {trip.location}
            </Text>
          </View>
        </View>

        {/* Right column: Price & Slots */}
        <View style={styles.rightColumn}>
          <Text style={styles.priceText}>
            {trip.price}
          </Text>
          <Text style={styles.slotsText}>
            {trip.slotsLeft}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  featuredCard: {
    width: width * 0.72,
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  vignetteOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  categoryBadgeText: {
    fontFamily: "Inter",
    fontSize: 8.5,
    fontWeight: "800",
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  durationBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  durationBadgeText: {
    fontFamily: "Inter",
    fontSize: 8.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  glassPlate: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    backgroundColor: "rgba(0, 0, 0, 0.55)", // Translucent frosted glass look
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftColumn: {
    flex: 1,
    paddingRight: 8,
  },
  titleText: {
    fontFamily: "Montserrat",
    fontSize: 13.5,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 2,
  },
  locationText: {
    fontFamily: "Inter",
    fontSize: 9.5,
    color: "rgba(255, 255, 255, 0.7)",
  },
  rightColumn: {
    alignItems: "flex-end",
  },
  priceText: {
    fontFamily: "Montserrat",
    fontSize: 15,
    fontWeight: "900",
    color: "#A6F16D", // Premium active signature accent color
  },
  slotsText: {
    fontFamily: "Inter",
    fontSize: 9,
    fontWeight: "800",
    color: "#FEF3C7",
    marginTop: 1,
  },
}) as any;
