import React, { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { useTheme, ThemePreference } from "../../utils/theme";
import { useAppSelector, useAppDispatch } from "../../src/store/hooks";
import { logout } from "../../src/store/slices/authSlice";
import { PillButton } from "../../components/PillButton";
import Icon from "react-native-remix-icon";
import { StatusBar } from "expo-status-bar";

export default function ProfileScreen() {
  const { colors, mode, rounded, themePreference, setThemePreference } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeOptions: { label: string; value: ThemePreference; icon: string }[] = [
    { label: "Light Theme", value: "light", icon: "sun-fill" },
    { label: "Dark Theme", value: "dark", icon: "moon-fill" },
    { label: "System Default", value: "system", icon: "settings-3-line" },
  ];

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out of TripMate?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: () => {
            dispatch(logout());
          }
        }
      ]
    );
  };

  const renderAvatar = () => {
    if (user?.avatar_url) {
      return (
        <Image
          source={{ uri: user.avatar_url }}
          style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.primary }}
          resizeMode="cover"
        />
      );
    }
    
    // Fallback Initials
    const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
    return (
      <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.primary }}>
        <Text style={{ color: colors.onSecondary, fontFamily: 'Montserrat', fontWeight: 'bold', fontSize: 40 }}>{initial}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={mode === "light" ? "dark" : "light"} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header / Banner Area */}
        <View style={{ backgroundColor: colors.primaryContainer, paddingTop: 80, paddingBottom: 60, alignItems: 'center', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          {renderAvatar()}
          
          <Text style={{ fontFamily: "Montserrat", fontSize: 24, fontWeight: "800", color: colors.onPrimaryContainer, marginTop: 16 }}>
            {user?.name || "TripMate User"}
          </Text>
          
          <Text style={{ fontFamily: "Inter", fontSize: 14, color: colors.onPrimaryContainer, opacity: 0.8, marginTop: 4 }}>
            {user?.email || ""}
          </Text>

          {/* Role Badge */}
          <View style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginTop: 12 }}>
            <Text style={{ color: colors.onPrimary, fontSize: 10, fontWeight: "bold", textTransform: 'uppercase', letterSpacing: 1 }}>
              {user?.role || "Traveler"}
            </Text>
          </View>
        </View>

        {/* Content Body */}
        <View className="px-6 mt-8">
          
          {/* Preferences / Stats Summary - Placeholder for aesthetics */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
            <View style={{ flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: rounded.default, alignItems: 'center', marginRight: 8, borderWidth: 1, borderColor: colors.outline }}>
              <Icon name="map-pin-line" size={24} color={colors.primary} />
              <Text style={{ fontFamily: "Montserrat", fontSize: 18, fontWeight: "700", color: colors.onSurface, marginTop: 8 }}>0</Text>
              <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', marginTop: 4 }}>Trips</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: rounded.default, alignItems: 'center', marginLeft: 8, borderWidth: 1, borderColor: colors.outline }}>
              <Icon name="star-line" size={24} color={colors.primary} />
              <Text style={{ fontFamily: "Montserrat", fontSize: 18, fontWeight: "700", color: colors.onSurface, marginTop: 8 }}>0</Text>
              <Text style={{ fontFamily: "Inter", fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', marginTop: 4 }}>Reviews</Text>
            </View>
          </View>

          {/* Settings Options */}
          <Text style={{ fontFamily: "Inter", fontSize: 12, fontWeight: "700", color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16 }}>
            Account Settings
          </Text>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.outline }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Icon name="user-settings-line" size={20} color={colors.onPrimaryContainer} />
            </View>
            <Text style={{ flex: 1, fontFamily: "Inter", fontSize: 15, fontWeight: "600", color: colors.onBackground }}>Edit Profile</Text>
            <Icon name="arrow-right-s-line" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.outline }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Icon name="notification-2-line" size={20} color={colors.onPrimaryContainer} />
            </View>
            <Text style={{ flex: 1, fontFamily: "Inter", fontSize: 15, fontWeight: "600", color: colors.onBackground }}>Notifications</Text>
            <Icon name="arrow-right-s-line" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.outline }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Icon name="shield-check-line" size={20} color={colors.onPrimaryContainer} />
            </View>
            <Text style={{ flex: 1, fontFamily: "Inter", fontSize: 15, fontWeight: "600", color: colors.onBackground }}>Privacy & Security</Text>
            <Icon name="arrow-right-s-line" size={20} color={colors.onSurfaceVariant} />
          </TouchableOpacity>

          {/* Theme Selector Dropdown */}
          <View style={{ marginBottom: 16 }}>
            <TouchableOpacity 
              onPress={() => setThemeDropdownOpen(!themeDropdownOpen)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: themeDropdownOpen ? 0 : 1, borderBottomColor: colors.outline }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryContainer, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Icon name="palette-line" size={20} color={colors.onPrimaryContainer} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: "Inter", fontSize: 15, fontWeight: "600", color: colors.onBackground }}>App Theme</Text>
                <Text style={{ fontFamily: "Inter", fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 }}>
                  {themeOptions.find(o => o.value === themePreference)?.label}
                </Text>
              </View>
              <Icon name={themeDropdownOpen ? "arrow-up-s-line" : "arrow-down-s-line"} size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>

            {themeDropdownOpen && (
              <View style={{ backgroundColor: colors.surface, borderRadius: rounded.default, borderWidth: 1, borderColor: colors.outline, overflow: 'hidden', marginTop: 4 }}>
                {themeOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setThemePreference(option.value);
                      setThemeDropdownOpen(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderBottomWidth: index === themeOptions.length - 1 ? 0 : 1,
                      borderBottomColor: colors.outline,
                      backgroundColor: themePreference === option.value ? colors.primaryContainer + "40" : "transparent"
                    }}
                  >
                    <Icon name={option.icon as any} size={18} color={themePreference === option.value ? colors.primary : colors.onSurfaceVariant} style={{ marginRight: 12 }} />
                    <Text style={{ fontFamily: "Inter", fontSize: 14, fontWeight: themePreference === option.value ? "700" : "500", color: themePreference === option.value ? colors.primary : colors.onSurface }}>
                      {option.label}
                    </Text>
                    {themePreference === option.value && (
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Icon name="check-line" size={18} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Logout Button */}
          <View className="mt-12">
            <PillButton 
              title="Sign Out" 
              onPress={handleLogout} 
              variant="primary" 
              icon="logout-box-r-line"
            />
          </View>

          <Text style={{ textAlign: 'center', fontFamily: "Inter", fontSize: 12, color: colors.onSurfaceVariant, marginTop: 32 }}>
            TripMate India v1.0.0
          </Text>

        </View>
      </ScrollView>
    </View>
  );
}
