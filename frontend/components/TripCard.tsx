import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-remix-icon";
import { useTheme } from "../utils/theme";

interface TripData {
  id: string;
  title: string;
  location: string;
  duration: any;
  price: string;
  slotsLeft: string;
  category: string;
  image: string;
  rating?: string;
}

interface TripCardProps {
  trip: TripData;
  onJoinPress?: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onJoinPress }) => {
  const { colors } = useTheme();
  const isBooked = trip.slotsLeft === "Fully Booked" || trip.slotsLeft === "Sold Out";
  
  const rating = trip.rating || "4.5";

  return (
    <View style={styles.card}>
      {/* Top Image Section with White Frame */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: trip.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        
        {/* Top Overlays */}
        <View style={styles.topContainer}>
          <View style={styles.topRow}>
            <View style={styles.tagsContainer}>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>{trip.category}</Text>
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Icon name="star-fill" size={10} color="#FFFFFF" />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom Content Section */}
      <View style={styles.bottomSection}>
        {/* Title and Top Rated row */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText} numberOfLines={1}>
            {trip.title}, {trip.location.split(',')[0]}
          </Text>
          <View style={styles.topRatedBadge}>
            <Text style={styles.topRatedText}>Top rated</Text>
          </View>
        </View>
        
        {/* Subtitle */}
        <Text style={styles.subtitleText} numberOfLines={1}>
          {trip.duration} Days Business Host
        </Text>

        {/* Footer row */}
        <View style={styles.footerRow}>
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>{trip.price}</Text>
          </View>

          <TouchableOpacity
            disabled={isBooked}
            style={[
              styles.bookButton,
              { backgroundColor: isBooked ? colors.inversePrimary : colors.primary }
            ]}
            onPress={onJoinPress}
            activeOpacity={0.8}
          >
            <Text style={styles.bookButtonText}>
              {isBooked ? "Sold Out" : "Book Now"}
            </Text>
            {!isBooked && (
              <View style={styles.bookIconWrapper}>
                <Icon name="arrow-right-up-line" size={14} color="#000000" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 380,
    width: '100%',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    padding: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    marginBottom: 16,
  },
  imageContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  topContainer: {
    padding: 12,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tagText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ratingText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSection: {
    marginTop: 16,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleText: {
    flex: 1,
    fontFamily: 'Montserrat',
    fontSize: 19,
    fontWeight: '800',
    color: '#000000',
    marginRight: 8,
  },
  topRatedBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  topRatedText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600',
    color: '#333333',
  },
  subtitleText: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: '#999999',
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricePill: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  priceText: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 24,
  },
  bookButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginRight: 8,
  },
  bookIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
