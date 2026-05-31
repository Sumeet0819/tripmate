import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-remix-icon";
import { useTheme } from "../utils/theme";

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

interface TripCardProps {
  trip: TripData;
  onJoinPress?: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onJoinPress }) => {
  const { colors } = useTheme();
  const isBooked = trip.slotsLeft === "Fully Booked";

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Left Column: Artistic Thumbnail with Duration Overlay */}
      <View style={styles.thumbnailWrapper}>
        <Image source={{ uri: trip.image }} style={styles.thumbnailImage} />
        <View style={styles.durationOverlay}>
          <Text style={styles.durationText}>{trip.duration.toUpperCase()}</Text>
        </View>
      </View>
      
      {/* Right Column: Dynamic Stacked Details */}
      <View style={styles.contentWrapper}>
        {/* Top: Category Tag & Location */}
        <View style={styles.headerRow}>
          <View style={[styles.tagBadge, { backgroundColor: colors.primaryContainer }]}>
            <Text style={[styles.tagBadgeText, { color: colors.onPrimaryContainer }]}>
              {trip.category.toUpperCase()}
            </Text>
          </View>
          <View style={styles.locationWrapper}>
            <Icon name="map-pin-2-fill" size={10} color={colors.onSurfaceVariant} />
            <Text style={[styles.locationText, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {trip.location.split(",")[0]}
            </Text>
          </View>
        </View>

        {/* Middle: Title */}
        <Text style={[styles.titleText, { color: colors.onSurface }]} numberOfLines={1}>
          {trip.title}
        </Text>

        {/* Bottom Area: Pricing, Pulse Status, and Premium CTA */}
        <View style={styles.footerRow}>
          <View style={styles.priceColumn}>
            <Text style={[styles.priceText, { color: colors.primary }]}>
              {trip.price}
            </Text>
            {/* Pulsing Status indicator dot */}
            <View style={styles.statusDotRow}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: isBooked ? colors.error : "#10B981" }
                ]} 
              />
              <Text style={[styles.slotsText, { color: colors.onSurfaceVariant }]}>
                {trip.slotsLeft}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            disabled={isBooked}
            style={[
              styles.joinButton, 
              { 
                backgroundColor: isBooked ? colors.outline : colors.secondary,
              }
            ]}
            onPress={onJoinPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.joinButtonText, { color: isBooked ? colors.onSurfaceVariant : colors.onSecondary }]}>
              {isBooked ? "SOLD OUT" : "JOIN"}
            </Text>
            {!isBooked && (
              <Icon 
                name="arrow-right-s-line" 
                size={12} 
                color={colors.onSecondary} 
                style={styles.arrowIcon}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
  },
  thumbnailWrapper: {
    width: 96,
    height: 116,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  durationOverlay: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: {
    fontFamily: "Inter",
    fontSize: 7.5,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  contentWrapper: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagBadgeText: {
    fontFamily: "Inter",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  locationWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    maxWidth: 90,
  },
  locationText: {
    fontFamily: "Inter",
    fontSize: 10,
    fontWeight: "600",
  },
  titleText: {
    fontFamily: "Montserrat",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },
  priceColumn: {
    justifyContent: "center",
  },
  priceText: {
    fontFamily: "Montserrat",
    fontSize: 15,
    fontWeight: "900",
  },
  statusDotRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  slotsText: {
    fontFamily: "Inter",
    fontSize: 9.5,
    fontWeight: "700",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    minWidth: 72,
  },
  joinButtonText: {
    fontFamily: "Inter",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  arrowIcon: {
    marginLeft: 2,
    marginTop: 0.5,
  },
}) as any;
