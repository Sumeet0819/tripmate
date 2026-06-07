import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { MotiView } from "moti";
import { FeaturedTripCard } from "./FeaturedTripCard";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_HEIGHT = 200;
const CARD_WIDTH = width * 0.72;

export const FeaturedTripStack = ({ trips }: { trips: any[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (trips.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % trips.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [trips.length]);

  if (!trips || trips.length === 0) return null;

  return (
    <View style={styles.container}>
      {trips.map((trip, index) => {
        const diff = (index - activeIndex + trips.length) % trips.length;
        const isVisible = diff <= 2 || trips.length <= 3;
        
        let scale = 1;
        let translateY = 0;
        let opacity = 1;
        let zIndex = trips.length - diff;
        
        if (diff === 0) {
          scale = 1;
          translateY = 0;
          opacity = 1;
        } else if (diff === 1) {
          scale = 0.9;
          translateY = 20;
          opacity = 0.8;
        } else if (diff === 2) {
          scale = 0.8;
          translateY = 40;
          opacity = 0.5;
        } else {
          scale = 0.8;
          translateY = 60;
          opacity = 0;
          zIndex = 0;
        }

        if (diff === trips.length - 1 && trips.length > 1) {
          scale = 1.05;
          translateY = -20; 
          opacity = 0;
          zIndex = trips.length + 1; 
        }

        if (!isVisible && diff !== trips.length - 1) return null;

        return (
          <MotiView
            key={trip.id}
            style={[styles.cardContainer, { zIndex }]}
            animate={{
              scale,
              translateY,
              opacity,
            }}
            transition={{
              type: "timing",
              duration: 800,
            }}
            pointerEvents={diff === 0 ? "auto" : "none"}
          >
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => router.push(`/trip/${trip.id}` as any)}
            >
              <FeaturedTripCard trip={trip} />
            </TouchableOpacity>
          </MotiView>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: CARD_HEIGHT + 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    marginTop: 18,
  },
  cardContainer: {
    position: 'absolute',
    top: 0,
    justifyContent:'center',
    alignItems:'center',
    width: CARD_WIDTH,
  }
});
