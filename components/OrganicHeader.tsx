import React from "react";
import { View, TouchableOpacity, TextInput, Image, StyleSheet } from "react-native";
import Icon from "react-native-remix-icon";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../utils/theme";

// Organic Connected Blob SVG Background
const OrganicPillBackground = ({ color }: { color: string }) => (
  <Svg width={280} height={48} viewBox="0 0 280 48">
    <Path
      d="M 24,0 L 110,0 C 122,0 125,12 135,12 C 145,12 148,0 160,0 L 190,0 C 202,0 205,12 215,12 C 225,12 228,0 240,0 L 256,0 A 24,24 0 0,1 280,24 A 24,24 0 0,1 256,48 L 240,48 C 228,48 225,36 215,36 C 205,36 202,48 190,48 L 160,48 C 148,48 145,36 135,36 C 125,36 122,48 110,48 L 24,48 A 24,24 0 0,1 0,24 A 24,24 0 0,1 24,0 Z"
      fill={color}
    />
  </Svg>
);

interface OrganicHeaderProps {
  search: string;
  onSearchChange: (text: string) => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const OrganicHeader: React.FC<OrganicHeaderProps> = ({
  search,
  onSearchChange,
  onNotificationPress,
  onProfilePress,
}) => {
  const { rounded, toggleTheme } = useTheme();

  return (
    <View style={styles.headerBar}>
      {/* Left Lime Starburst Button (Theme Toggle) */}
      <TouchableOpacity
        onPress={toggleTheme}
        style={[
          styles.toggleButton,
          {
            borderRadius: rounded.full,
            backgroundColor: "#A6F16D", // Always Signature Lime green for mockup brand presence
          },
        ]}
        activeOpacity={0.8}
      >
        <Icon 
          name="asterisk" 
          size={22} 
          color="#072D1B" // Dark forest green asterisk
        />
      </TouchableOpacity>

      {/* Right Fluid Connected Pill Container */}
      <View style={styles.connectedContainer}>
        {/* Organic Connected Blob SVG Background */}
        <OrganicPillBackground color="#1E5E3D" />

        {/* Absolute Overlaid Components */}
        
        {/* 1. Search Capsule Area */}
        <View style={styles.searchArea}>
          <Icon 
            name="search-2-line" 
            size={16} 
            color="#FFFFFF" 
          />
          <TextInput
            style={styles.searchInput}
            placeholder="SEARCH"
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={search}
            onChangeText={onSearchChange}
          />
        </View>

        {/* 2. Notification Bell Area */}
        <TouchableOpacity 
          style={styles.bellArea}
          activeOpacity={0.7}
          onPress={onNotificationPress}
        >
          <Icon 
            name="notification-3-line" 
            size={18} 
            color="#FFFFFF" 
          />
          {/* Lime badge dot as shown in the premium mockup */}
          <View style={styles.limeBadgeDot} />
        </TouchableOpacity>

        {/* 3. Circular Profile Avatar Area */}
        <TouchableOpacity 
          style={styles.avatarArea}
          activeOpacity={0.8}
          onPress={onProfilePress}
        >
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#072D1B", // Deep forest green header background from mockup
  },
  toggleButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  connectedContainer: {
    width: 280,
    height: 48,
    position: "relative",
  },
  searchArea: {
    position: "absolute",
    left: 12,
    top: 0,
    width: 110,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
    paddingLeft: 6,
    fontFamily: "Inter",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#FFFFFF",
  },
  bellArea: {
    position: "absolute",
    left: 157, // Center is 175. 175 - 18 = 157
    top: 6, // 24 - 18 = 6
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  limeBadgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#A6F16D",
  },
  avatarArea: {
    position: "absolute",
    left: 238, // Center is 256. 256 - 18 = 238
    top: 6, // 24 - 18 = 6
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#A6F16D", // Signature Lime outline from mockup
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
});
