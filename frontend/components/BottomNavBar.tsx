import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "react-native-remix-icon";
import { useTheme } from "../utils/theme";
import { MotiView, MotiText } from "moti";

interface BottomNavBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
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
        } else if (route.name === "dashboard") {
          iconFocused = "layout-grid-fill";
          iconUnfocused = "layout-grid-line";
        } else if (route.name === "platoons") {
          iconFocused = "team-fill";
          iconUnfocused = "team-line";
        } else if (route.name === "profile") {
          iconFocused = "user-fill";
          iconUnfocused = "user-line";
        }

        return (
          <View key={route.key} style={styles.tabItem}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.touchable}>
              <MotiView
                animate={{
                  backgroundColor: isFocused ? colors.primaryContainer : "transparent",
                  paddingHorizontal: isFocused ? 12 : 0,
                  width: isFocused ? 110 : 40,
                }}
                transition={{
                  type: "spring",
                  damping: 25,
                  mass: 0.8,
                  stiffness: 150,
                }}
                style={styles.animatedCapsule}
              >
                <Icon
                  name={(isFocused ? iconFocused : iconUnfocused) as any}
                  size={18}
                  color={isFocused ? colors.onPrimaryContainer : colors.onPrimary + "B0"}
                />

                {isFocused && (
                  <MotiText
                    from={{ opacity: 0, scale: 0.8, translateX: -6 }}
                    animate={{ opacity: 1, scale: 1, translateX: 0 }}
                    transition={{
                      type: "spring",
                      damping: 22,
                      mass: 0.8,
                      stiffness: 160,
                    }}
                    style={[styles.activeText, { color: colors.onPrimaryContainer }]}
                    numberOfLines={1}
                  >
                    {label.toString().toUpperCase()}
                  </MotiText>
                )}
              </MotiView>
            </TouchableOpacity>
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
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    elevation: 0,
    shadowOpacity: 0,
    zIndex: 100,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  touchable: {
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  animatedCapsule: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  activeText: {
    fontSize: 9.5,
    fontWeight: "bold",
    fontFamily: "Inter",
    letterSpacing: 0.5,
    marginLeft: 6,
  },
});
