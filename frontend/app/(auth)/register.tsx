import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-remix-icon";
import { useAppNavigation } from "../../utils/navigation";
import { useTheme } from "../../utils/theme";
import { hexToRgba } from "../../utils/colors";

export default function RegisterScreen() {
  const navigation = useAppNavigation();
  const { colors, mode, rounded } = useTheme();

  return (
    <View
      className="flex-1 justify-center items-center px-6"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar style={mode === "light" ? "dark" : "light"} />

      <View
        className="w-16 h-16 items-center justify-center mb-6"
        style={{
          borderRadius: rounded.full,
          backgroundColor: hexToRgba(colors.primary, 0.1),
        }}
      >
        <Icon name="user-add-fill" size={32} color={colors.primary} />
      </View>

      <Text
        className="text-2xl font-extrabold mb-2"
        style={{
          fontFamily: "Montserrat",
          color: colors.onBackground,
        }}
      >
        Create Account
      </Text>

      <Text
        className="text-center mb-8 text-sm"
        style={{
          fontFamily: "Inter",
          color: colors.onSurfaceVariant,
        }}
      >
        Join platoons and unlock exclusive travel deals.
      </Text>

      <TouchableOpacity
        className="w-full py-4 items-center mb-4"
        style={{
          borderRadius: rounded.default,
          backgroundColor: colors.primary,
        }}
        activeOpacity={0.85}
        onPress={() => navigation.back()}
      >
        <Text
          className="font-bold text-base"
          style={{
            fontFamily: "Montserrat",
            color: colors.onPrimary,
          }}
        >
          Go Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}
