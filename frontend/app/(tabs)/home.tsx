import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTheme } from "../../utils/theme";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-remix-icon";
import { OrganicHeader } from "../../components/OrganicHeader";
import { FeaturedTripCard } from "../../components/FeaturedTripCard";
import { TripCard } from "../../components/TripCard";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { fetchTrips, Trip } from "../../src/store/slices/tripsSlice";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const { colors, mode } = useTheme();
  const [search, setSearch] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { items: trips, status } = useAppSelector((state) => state.trips);

  useEffect(() => {
    dispatch(fetchTrips({}));
  }, [dispatch]);

  const mapTripToCardData = (trip: Trip) => ({
    id: trip.id,
    title: trip.title,
    location: trip.location,
    duration: `${trip.duration} Days`,
    price: `₹${trip.price.toLocaleString("en-IN")}`,
    slotsLeft: trip.slots_left === 0 ? "Fully Booked" : `${trip.slots_left} slots left`,
    category: trip.category,
    image: trip.image_url,
    isFeatured: trip.is_featured,
  });

  const filteredTrips = trips.filter(
    (trip) =>
      trip.title.toLowerCase().includes(search.toLowerCase()) ||
      trip.location.toLowerCase().includes(search.toLowerCase()) ||
      trip.category.toLowerCase().includes(search.toLowerCase())
  );

  const featuredTrips = filteredTrips.filter((t) => t.is_featured).map(mapTripToCardData);
  const regularTrips = filteredTrips.filter((t) => !t.is_featured).map(mapTripToCardData);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.primary }}>
      <StatusBar style={mode === "light" ? "dark" : "light"} />

      {/* Interactive Organic Search Header */}
      <OrganicHeader search={search} onSearchChange={setSearch} />

      {/* Main Discover Layout */}
      <ScrollView
        className="flex-1"
        style={{
          backgroundColor: colors.background,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          marginTop: -8,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Page Main Header */}
        <View className="px-6 mt-6">
          <Text
            className="text-2xl font-extrabold tracking-tight"
            style={{
              fontFamily: "Montserrat",
              color: colors.onBackground,
            }}
          >
            Explore Journeys
          </Text>
          <Text
            style={{
              fontFamily: "Inter",
              color: colors.onSurfaceVariant,
              fontSize: 13,
              marginTop: 4,
            }}
          >
            Discover active platoons and join premium travel expeditions.
          </Text>
        </View>

        {/* FEATURED TRIPS: Slider Section */}
        {featuredTrips.length > 0 && (
          <View style={styles.featuredSection}>
            <View className="px-6 flex-row justify-between items-center mb-4">
              <Text
                style={{
                  fontFamily: "Montserrat",
                  color: colors.onBackground,
                  fontSize: 16,
                  fontWeight: "800",
                }}
              >
                Featured Expeditions
              </Text>
              <Text
                style={{
                  fontFamily: "Inter",
                  color: colors.secondary,
                  fontSize: 12,
                  fontWeight: "700",
                }}
              >
                See All
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
            >
              {featuredTrips.map((trip) => (
                <TouchableOpacity 
                  key={trip.id} 
                  activeOpacity={0.9} 
                  onPress={() => router.push(`/trip/${trip.id}` as any)}
                >
                  <FeaturedTripCard trip={trip} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ALL TRIPS: Vertical List Section */}
        <View className="px-6 mt-8">
          <Text
            style={{
              fontFamily: "Montserrat",
              color: colors.onBackground,
              fontSize: 16,
              fontWeight: "800",
              marginBottom: 16,
            }}
          >
            All Available Journeys ({filteredTrips.length})
          </Text>

          {filteredTrips.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
              <Icon name="search-eye-line" size={40} color={colors.onSurfaceVariant} />
              <Text style={[styles.emptyText, { color: colors.onSurface }]}>
                No trips matching your search
              </Text>
            </View>
          ) : status === "loading" && trips.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {regularTrips.concat(search ? featuredTrips : []).map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  activeOpacity={0.95}
                  onPress={() => router.push(`/trip/${trip.id}` as any)}
                >
                  <TripCard
                    trip={trip}
                    onJoinPress={() => router.push(`/trip/${trip.id}` as any)}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  featuredSection: {
    marginTop: 24,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter",
    fontSize: 13,
    fontWeight: "600",
  },
});
