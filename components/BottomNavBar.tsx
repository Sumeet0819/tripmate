import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-remix-icon";

interface BottomNavBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        // Map icons dynamically based on route name
        let iconFocused = "compass-3-fill";
        let iconUnfocused = "compass-3-line";
        if (route.name === "home") {
          iconFocused = "compass-3-fill";
          iconUnfocused = "compass-3-line";
        } else if (route.name === "platoons") {
          iconFocused = "team-fill";
          iconUnfocused = "team-line";
        } else if (route.name === "profile") {
          iconFocused = "user-fill";
          iconUnfocused = "user-line";
        }

        return (
          <View key={route.key} style={styles.tabItem}>
            {isFocused ? (
              <TouchableOpacity
                onPress={onPress}
                style={styles.activeCapsule}
                activeOpacity={0.85}
              >
                <Icon name={iconFocused as any} size={18} color="#072D1B" />
                <Text style={styles.activeText}>
                  {label.toString().toUpperCase()}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onPress}
                style={styles.inactiveButton}
                activeOpacity={0.7}
              >
                <Icon name={iconUnfocused as any} size={20} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    height: 64,
    backgroundColor: "#072D1B", // Solid dark forest green from mockup
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    elevation: 0,
    shadowOpacity: 0,
    zIndex: 100,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeCapsule: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A6F16D", // Lime green active capsule from mockup
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    gap: 6,
  },
  activeText: {
    color: "#072D1B",
    fontSize: 11,
    fontWeight: "bold",
    fontFamily: "Inter",
    letterSpacing: 0.5,
  },
  inactiveButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
