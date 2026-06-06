import React, { useState, useRef } from "react";
import { Image, StyleSheet, TextInput, TouchableOpacity, View, Dimensions, Text } from "react-native";
import Icon from "react-native-remix-icon";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../utils/theme";
import { MotiView } from "moti";
import { useAppSelector } from "../src/store/hooks";

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
  const { colors, mode, rounded, toggleTheme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  
  // Fetch user from Redux store
  const user = useAppSelector((state) => state.auth.user);

  const screenWidth = Dimensions.get("window").width;
  const AVAILABLE_WIDTH = screenWidth - 48; // 24 padding on each side
  const CONTAINER_LEFT = AVAILABLE_WIDTH - 280; // Distance from left edge of content to connectedContainer

  const renderAvatar = () => {
    if (user?.avatar_url) {
      return (
        <Image
          source={{ uri: user.avatar_url }}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      );
    }
    
    // Fallback Initials
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
    return (
      <View style={[styles.avatarImage, { backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ color: colors.onSecondary, fontWeight: 'bold', fontSize: 16 }}>{initial}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.headerBar, { backgroundColor: colors.primary }]}>
      {/* Left Dynamic Theme Toggle Button */}
      <MotiView
        animate={{
          opacity: isFocused ? 0 : 1,
          scale: isFocused ? 0.8 : 1,
        }}
        transition={
          isFocused
            ? { type: "timing", duration: 50 }
            : { type: "spring", damping: 15, stiffness: 180 }
        }
        pointerEvents={isFocused ? "none" : "auto"}
        style={styles.toggleButtonContainer}
      >
        <TouchableOpacity
          onPress={toggleTheme}
          style={[
            styles.toggleButton,
            {
              borderRadius: rounded.full,
              backgroundColor: colors.secondary, // Dynamic themed brand accent
            },
          ]}
          activeOpacity={0.8}
          disabled={isFocused}
        >
          <Icon
            name={mode === "light" ? "moon-fill" : "sun-fill"}
            size={22}
            color={colors.onSecondary} // High contrast themed icon color
          />
        </TouchableOpacity>
      </MotiView>

      {/* Right Fluid Connected Pill Container */}
      <View style={styles.connectedContainer}>
        {/* Organic Connected Blob SVG Background */}
        <MotiView
          animate={{
            opacity: isFocused ? 0 : 1,
            scale: isFocused ? 0.95 : 1,
          }}
          transition={
            isFocused
              ? { type: "timing", duration: 50 }
              : { type: "spring", damping: 15, stiffness: 180 }
          }
          pointerEvents="none"
          style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
        >
          <OrganicPillBackground color={colors.primaryContainer} />
        </MotiView>

        {/* Absolute Overlaid Components */}

        {/* 1. Search Capsule Area */}
        <MotiView
          animate={{
            left: isFocused ? -CONTAINER_LEFT : 12,
            width: isFocused ? AVAILABLE_WIDTH : 110,
            paddingLeft: isFocused ? 16 : 0,
            backgroundColor: isFocused ? colors.primaryContainer : colors.primaryContainer + "00",
          }}
          transition={{
            type: "spring",
            damping: 25,
            mass: 0.8,
            stiffness: 150,
          }}
          style={[
            styles.searchArea,
            {
              borderRadius: 24,
              zIndex: isFocused ? 99 : 1,
            },
          ]}
        >
          <Icon name="search-2-line" size={16} color={colors.onPrimaryContainer} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.onPrimaryContainer }]}
            placeholder="SEARCH"
            placeholderTextColor={colors.onPrimaryContainer + "B0"}
            value={search}
            onChangeText={onSearchChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {isFocused && (
            <TouchableOpacity
              onPress={() => {
                if (search) {
                  onSearchChange("");
                } else {
                  searchInputRef.current?.blur();
                }
              }}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Icon name="close-line" size={16} color={colors.onPrimaryContainer} />
            </TouchableOpacity>
          )}
        </MotiView>

        {/* 2. Notification Bell Area */}
        <MotiView
          animate={{
            opacity: isFocused ? 0 : 1,
            scale: isFocused ? 0 : 1,
          }}
          transition={
            isFocused
              ? { type: "timing", duration: 50 }
              : { type: "spring", damping: 15, stiffness: 180 }
          }
          pointerEvents={isFocused ? "none" : "auto"}
          style={styles.bellArea}
        >
          <TouchableOpacity
            style={styles.iconContainer}
            activeOpacity={0.7}
            onPress={onNotificationPress}
            disabled={isFocused}
          >
            <Icon name="notification-3-line" size={18} color={colors.onPrimaryContainer} />
            {/* Lime badge dot as shown in the premium mockup */}
            <View style={styles.limeBadgeDot} />
          </TouchableOpacity>
        </MotiView>

        {/* 3. Circular Profile Avatar Area */}
        <MotiView
          animate={{
            opacity: isFocused ? 0 : 1,
            scale: isFocused ? 0 : 1,
          }}
          transition={
            isFocused
              ? { type: "timing", duration: 50 }
              : { type: "spring", damping: 15, stiffness: 180 }
          }
          pointerEvents={isFocused ? "none" : "auto"}
          style={styles.avatarArea}
        >
          <TouchableOpacity
            style={styles.avatarTouchable}
            activeOpacity={0.8}
            onPress={onProfilePress}
            disabled={isFocused}
          >
            {renderAvatar()}
          </TouchableOpacity>
        </MotiView>
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
    backgroundColor: "transparent",
  },
  toggleButtonContainer: {
    width: 48,
    height: 48,
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
  clearButton: {
    paddingLeft: 6,
    paddingRight: 16,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
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
  iconContainer: {
    width: "100%",
    height: "100%",
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
  avatarTouchable: {
    width: "100%",
    height: "100%",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
} as any);
