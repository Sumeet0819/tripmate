import React, { useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Icon from 'react-native-remix-icon';
import { useTheme } from '../../utils/theme';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { fetchTripById, clearSelectedTrip } from '../../src/store/slices/tripsSlice';

import { createPlatoonThunk } from '../../src/store/slices/platoonsSlice';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { colors, rounded } = useTheme();

  const { selectedTrip: trip, selectedTripStatus: status } = useAppSelector(state => state.trips);

  useEffect(() => {
    if (id) {
      dispatch(fetchTripById(id));
    }
    return () => {
      dispatch(clearSelectedTrip());
    };
  }, [id, dispatch]);

  const handleJoinPress = async () => {
    try {
      await dispatch(createPlatoonThunk(id as string)).unwrap();
      Alert.alert("Success", "You have successfully created a platoon for this trip!");
      router.back(); // Or router.push('/squads') if that screen exists
    } catch (err) {
      Alert.alert("Error", err as string || "Failed to join trip");
    }
  };

  if (status === 'loading' || !trip) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isBooked = trip.slots_left === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: trip.image_url }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />
          
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={() => router.back()}
          >
            <Icon name="arrow-left-s-line" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.categoryText, { color: colors.onPrimaryContainer }]}>{trip.category}</Text>
            </View>
            <Text style={styles.heroTitle}>{trip.title}</Text>
            <View style={styles.heroLocation}>
              <Icon name="map-pin-2-fill" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroLocationText}>{trip.location}</Text>
            </View>
          </View>
        </View>

        {/* Key Info Strip */}
        <View style={styles.infoStrip}>
          <View style={styles.infoItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
              <Icon name="time-line" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Duration</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>{trip.duration} Days</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
              <Icon name="group-line" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Capacity</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]}>{trip.slots_total} People</Text>
          </View>
          <View style={styles.infoItem}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
              <Icon name="user-star-line" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.infoLabel, { color: colors.onSurfaceVariant }]}>Provider</Text>
            <Text style={[styles.infoValue, { color: colors.onBackground }]} numberOfLines={1}>
              {trip.provider?.name || "Verified"}
            </Text>
          </View>
        </View>

        {/* Itinerary Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>Itinerary</Text>
          
          {trip.itinerary && trip.itinerary.length > 0 ? (
            <View style={styles.itineraryList}>
              {trip.itinerary.map((day: any, index: number) => (
                <View key={index} style={styles.itineraryDay}>
                  <View style={styles.dayMarkerContainer}>
                    <View style={[styles.dayDot, { backgroundColor: colors.primary }]} />
                    {index !== trip.itinerary!.length - 1 && (
                      <View style={[styles.dayLine, { backgroundColor: colors.outline }]} />
                    )}
                  </View>
                  <View style={[styles.dayCard, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.dayTitle, { color: colors.primary }]}>Day {day.day}</Text>
                    <Text style={[styles.dayActivity, { color: colors.onSurface }]}>{day.activity}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyItinerary, { color: colors.onSurfaceVariant }]}>
              Itinerary details will be provided by the guide.
            </Text>
          )}
        </View>

      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.priceLabel, { color: colors.onSurfaceVariant }]}>Total Price</Text>
          <Text style={[styles.priceValue, { color: colors.primary }]}>
            ₹{trip.price.toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.slotsLeftText, { color: isBooked ? colors.error : colors.onSurfaceVariant }]}>
            {isBooked ? "Sold Out" : `${trip.slots_left} slots remaining`}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.joinButton, 
            { backgroundColor: isBooked ? colors.outline : colors.primary }
          ]}
          disabled={isBooked}
          onPress={handleJoinPress}
        >
          <Text style={[styles.joinButtonText, { color: isBooked ? colors.onSurfaceVariant : colors.onPrimary }]}>
            {isBooked ? "UNAVAILABLE" : "JOIN PLATOON"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  heroContainer: {
    width: '100%',
    height: 350,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  heroContent: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryText: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: 'Montserrat',
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLocationText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  infoStrip: {
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontFamily: 'Montserrat',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  itineraryList: {
    gap: 16,
  },
  itineraryDay: {
    flexDirection: 'row',
  },
  dayMarkerContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  dayDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  dayLine: {
    flex: 1,
    width: 2,
    marginTop: 4,
    marginBottom: -16, // Connect to next dot
  },
  dayCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dayTitle: {
    fontFamily: 'Montserrat',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  dayActivity: {
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 20,
  },
  emptyItinerary: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32, // safe area padding
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -8 },
    shadowRadius: 16,
  },
  priceLabel: {
    fontFamily: 'Inter',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  priceValue: {
    fontFamily: 'Montserrat',
    fontSize: 24,
    fontWeight: '900',
  },
  slotsLeftText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  joinButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
