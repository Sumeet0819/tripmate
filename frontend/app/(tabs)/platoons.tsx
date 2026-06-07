import React, { useEffect } from "react";
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../utils/theme";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { fetchMyPlatoons } from "../../src/store/slices/platoonsSlice";
import { Platoon } from "../../src/services/api/platoonsApi";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-remix-icon";

export default function PlatoonsScreen() {
  const { colors, rounded } = useTheme();
  const dispatch = useAppDispatch();
  const { myPlatoons, status } = useAppSelector((state) => state.platoons);

  useEffect(() => {
    dispatch(fetchMyPlatoons());
  }, [dispatch]);

  const renderPlatoonCard = ({ item }: { item: Platoon }) => {
    const trip = item.trip;
    if (!trip) return null;

    const statusColors: Record<string, { bg: string, text: string }> = {
      planning: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer },
      confirmed: { bg: colors.primaryContainer, text: colors.onPrimaryContainer },
      active: { bg: colors.tertiaryContainer, text: colors.onTertiaryContainer },
      completed: { bg: colors.surfaceVariant, text: colors.onSurfaceVariant },
    };

    const currentStatusColor = statusColors[item.status] || statusColors.planning;

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outline, borderRadius: rounded.lg }]}
        activeOpacity={0.9}
      >
        <Image source={{ uri: trip.image_url }} style={[styles.cardImage, { borderTopLeftRadius: rounded.lg, borderTopRightRadius: rounded.lg }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.statusBadge, { backgroundColor: currentStatusColor.bg }]}>
              <Text style={[styles.statusText, { color: currentStatusColor.text }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.dateText, { color: colors.onSurfaceVariant }]}>
              Created {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={[styles.tripTitle, { color: colors.onSurface }]} numberOfLines={1}>
            {trip.title}
          </Text>
          <View style={styles.locationContainer}>
            <Icon name="map-pin-2-fill" size={14} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.onSurfaceVariant }]} numberOfLines={1}>
              {trip.location}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (status === 'loading' && myPlatoons.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.onBackground }]}>My Platoons</Text>
        <Text style={[styles.headerSubtitle, { color: colors.onSurfaceVariant }]}>
          Trips you've joined or created
        </Text>
      </View>

      <FlatList
        data={myPlatoons}
        keyExtractor={(item) => item.id}
        renderItem={renderPlatoonCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="group-line" size={64} color={colors.outline} />
            <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>No Platoons Yet</Text>
            <Text style={[styles.emptySubtitle, { color: colors.onSurfaceVariant }]}>
              You haven't joined or created any platoons yet. Explore trips to find your next squad!
            </Text>
          </View>
        }
        refreshing={status === 'loading'}
        onRefresh={() => dispatch(fetchMyPlatoons())}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: "Montserrat",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: "Inter",
    fontSize: 14,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 20,
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardImage: {
    width: "100%",
    height: 140,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: "Inter",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  dateText: {
    fontFamily: "Inter",
    fontSize: 11,
  },
  tripTitle: {
    fontFamily: "Montserrat",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontFamily: "Inter",
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: "Montserrat",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "Inter",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
});
