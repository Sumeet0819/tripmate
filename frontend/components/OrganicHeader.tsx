import React, { useState, useRef } from "react";
import { Image, StyleSheet, TextInput, TouchableOpacity, View, Dimensions, Text } from "react-native";
import Icon from "react-native-remix-icon";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../utils/theme";
import { MotiView } from "moti";
import { useAppSelector } from "../src/store/hooks";

// Organic Connected Blob SVG Background
const OrganicPillBackground = ({ color, width }: { color: string; width: number }) => {
  const AvatarCenter = width - 24;
  const BellCenter = width - 105;
  const SearchEnd = width - 186;

  const safeSearchEnd = Math.max(24, SearchEnd);

  const path = `M 24,0 L ${safeSearchEnd},0 C ${safeSearchEnd + 20},0 ${safeSearchEnd + 20},16 ${safeSearchEnd + 40.5},16 C ${BellCenter - 20},16 ${BellCenter - 20},0 ${BellCenter},0 C ${BellCenter + 20},0 ${BellCenter + 20},16 ${BellCenter + 40.5},16 C ${AvatarCenter - 20},16 ${AvatarCenter - 20},0 ${AvatarCenter},0 A 24,24 0 0,1 ${width},24 A 24,24 0 0,1 ${AvatarCenter},48 C ${AvatarCenter - 20},48 ${AvatarCenter - 20},32 ${BellCenter + 40.5},32 C ${BellCenter + 20},32 ${BellCenter + 20},48 ${BellCenter},48 C ${BellCenter - 20},48 ${BellCenter - 20},32 ${safeSearchEnd + 40.5},32 C ${safeSearchEnd + 20},32 ${safeSearchEnd + 20},48 ${safeSearchEnd},48 L 24,48 A 24,24 0 0,1 0,24 A 24,24 0 0,1 24,0 Z`;

  return (
    <Svg width={width} height={48} viewBox={`0 0 ${width} 48`}>
      <Path d={path} fill={color} />
    </Svg>
  );
};

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
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  
  // Fetch user from Redux store
  const user = useAppSelector((state) => state.auth.user);

  const screenWidth = Dimensions.get("window").width;
  const AVAILABLE_WIDTH = screenWidth - 48; // 24 padding on each side

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

      {/* Right Fluid Connected Pill Container */}
      <View style={[styles.connectedContainer, { width: AVAILABLE_WIDTH }]}>
        {/* Organic Connected Blob SVG Background */}
        <MotiView
          animate={{
            opacity: isFocused ? 0 : 1,
            scale: isFocused ? 0.95 : 1,
          }}
          transition={
            isFocused
              ? { type: "timing", duration: 50 }
              : { type: "timing", duration: 250 }
          }
          pointerEvents="none"
          style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}
        >
          <OrganicPillBackground color={colors.surface} width={AVAILABLE_WIDTH} />
        </MotiView>

        {/* Absolute Overlaid Components */}

        {/* 1. Search Capsule Area */}
        <MotiView
          animate={{
            left: isFocused ? 0 : 12,
            width: isFocused ? AVAILABLE_WIDTH : AVAILABLE_WIDTH - 170,
            paddingLeft: isFocused ? 16 : 0,
            backgroundColor: isFocused ? colors.surface : colors.surface + "00",
          }}
          transition={
            isFocused
              ? { type: "spring", damping: 25, mass: 0.8, stiffness: 150 }
              : { type: "timing", duration: 250 }
          }
          style={[
            styles.searchArea,
            {
              borderRadius: 24,
              zIndex: isFocused ? 99 : 1,
            },
          ]}
        >
          <Icon name="search-2-line" size={16} color={colors.secondary} />
          <TextInput
            ref={searchInputRef}
            style={[styles.searchInput, { color: colors.secondary }]}
            placeholder="SEARCH"
            placeholderTextColor={colors.secondary + "B0"}
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
              <Icon name="close-line" size={16} color={colors.secondary} />
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
              : { type: "timing", duration: 250 }
          }
          pointerEvents={isFocused ? "none" : "auto"}
          style={[styles.bellArea, { left: AVAILABLE_WIDTH - 123 }]}
        >
          <TouchableOpacity
            style={styles.iconContainer}
            activeOpacity={0.7}
            onPress={onNotificationPress}
            disabled={isFocused}
          >
            <Icon name="notification-3-line" size={18} color={colors.secondary} />
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
              : { type: "timing", duration: 250 }
          }
          pointerEvents={isFocused ? "none" : "auto"}
          style={[styles.avatarArea, { left: AVAILABLE_WIDTH - 42 }]}
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
    justifyContent: "flex-end",
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
    height: 48,
    position: "relative",
  },
  searchArea: {
    position: "absolute",
    top: 0,
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
    top: 6, // 24 - 18 = 6
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    // borderColor: "#A6F16D", // Signature Lime outline from mockup
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
