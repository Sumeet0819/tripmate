import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../../utils/theme";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-remix-icon";
import { OrganicHeader } from "../../components/OrganicHeader";
import { FeaturedTripCard } from "../../components/FeaturedTripCard";
import { TripCard } from "../../components/TripCard";

const AVAILABLE_TRIPS = [
  {
    id: "featured-1",
    title: "Ladakh Bike Expedition",
    location: "Leh-Ladakh, India",
    duration: "9 Days",
    price: "₹34,500",
    slotsLeft: "3 slots left",
    category: "Adventure",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400",
    isFeatured: true,
  },
  {
    id: "featured-2",
    title: "Kerala Backwaters Cruise",
    location: "Alleppey, Kerala",
    duration: "5 Days",
    price: "₹18,200",
    slotsLeft: "6 slots left",
    category: "Leisure",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=400",
    isFeatured: true,
  },
  {
    id: "trip-3",
    title: "Jaipur Forts & Heritage",
    location: "Jaipur, Rajasthan",
    duration: "3 Days",
    price: "₹9,800",
    slotsLeft: "8 slots left",
    category: "Heritage",
    image: "https://images.unsplash.com/photo-1477587458883-47135acdb7ae?w=400",
    isFeatured: false,
  },
  {
    id: "trip-4",
    title: "Goa Watersports & Beach",
    location: "Calangute, Goa",
    duration: "4 Days",
    price: "₹12,400",
    slotsLeft: "2 slots left",
    category: "Beach",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    isFeatured: false,
  },
  {
    id: "trip-5",
    title: "Valley of Flowers Trek",
    location: "Chamoli, Uttarakhand",
    duration: "7 Days",
    price: "₹22,100",
    slotsLeft: "Fully Booked",
    category: "Trekking",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
    isFeatured: false,
  },
  {
    id: "trip-6",
    title: "Hampi Ruins Exploration",
    location: "Hampi, Karnataka",
    duration: "3 Days",
    price: "₹8,500",
    slotsLeft: "11 slots left",
    category: "Heritage",
    image: "https://images.unsplash.com/photo-1600100397608-f010f423b971?w=400",
    isFeatured: false,
  },
];

export default function HomeScreen() {
  const { colors, mode } = useTheme();
  const [search, setSearch] = useState("");

  const filteredTrips = AVAILABLE_TRIPS.filter(
    (trip) =>
      trip.title.toLowerCase().includes(search.toLowerCase()) ||
      trip.location.toLowerCase().includes(search.toLowerCase()) ||
      trip.category.toLowerCase().includes(search.toLowerCase())
  );

  const featuredTrips = filteredTrips.filter((t) => t.isFeatured);
  const regularTrips = filteredTrips.filter((t) => !t.isFeatured);

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
                <FeaturedTripCard key={trip.id} trip={trip} />
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
          ) : (
            <View style={{ gap: 16 }}>
              {regularTrips.concat(search ? featuredTrips : []).map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onJoinPress={() => console.log("Joined:", trip.title)}
                />
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
