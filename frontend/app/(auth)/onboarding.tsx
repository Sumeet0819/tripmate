import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-remix-icon";
import { useAppNavigation } from "../../utils/navigation";
import { useTheme } from "../../utils/theme";
import { PillButton } from "../../components/PillButton";

const { height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const navigation = useAppNavigation();
  const { colors, mode, rounded } = useTheme();

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar style={mode === "light" ? "dark" : "light"} />

      {/* Decorative background layers */}
      <View
        className="absolute top-0 left-0 right-0"
        style={{
          height: height * 0.6,
          backgroundColor: colors.surfaceContainer,
        }}
      />
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: height * 0.45,
          backgroundColor: colors.surfaceDim,
        }}
      />

      {/* Decorative ambient themed circles */}
      <View
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          backgroundColor: colors.primary,
          opacity: 0.08,
          top: -80,
          right: -80,
        }}
      />
      <View
        className="absolute rounded-full"
        style={{
          width: 250,
          height: 250,
          backgroundColor: colors.secondary,
          opacity: 0.08,
          bottom: 120,
          left: -100,
        }}
      />
      <View
        className="absolute rounded-full"
        style={{
          width: 160,
          height: 160,
          backgroundColor: colors.primary,
          opacity: 0.05,
          top: height * 0.38,
          right: -40,
        }}
      />
      {/* Content */}
      <View className="flex-1 px-7 pt-24 justify-center">
        {/* Logo area */}
        <View className="flex-row items-center mb-14">
          <View
            className="w-11 h-11 items-center justify-center mr-2.5"
            style={{
              borderRadius: rounded.md,
              backgroundColor: colors.primary,
            }}
          >
            <Icon name="send-plane-fill" size={22} color={colors.onPrimary} />
          </View>
          <Text
            className="text-[26px] font-extrabold tracking-tighter"
            style={{
              fontFamily: "Montserrat",
              color: colors.onSurface,
            }}
          >
            TripMate
          </Text>
          <Text
            className="text-sm font-semibold ml-1 mt-1.5"
            style={{
              color: colors.primary,
            }}
          >
            India
          </Text>
        </View>

        {/* Hero text */}
        <View className="mb-10">
          <Text
            className="text-[40px] font-extrabold leading-[48px] tracking-tight mb-4"
            style={{
              fontFamily: "Montserrat",
              color: colors.onSurface,
            }}
          >
            Travel Together,{"\n"}Save Together
          </Text>
          <Text
            className="text-base leading-6 font-normal"
            style={{
              fontFamily: "Inter",
              color: colors.onSurfaceVariant,
            }}
          >
            Join platoons, discover curated trips, and unlock exclusive deals across India.
          </Text>
        </View>

        {/* Feature pills */}
        <View className="flex-row gap-2.5 flex-wrap">
          <View
            className="flex-row items-center gap-1.5 border px-3.5 py-2"
            style={{
              borderRadius: rounded.full,
              backgroundColor: colors.primary,
              borderColor: colors.outlineVariant,
            }}
          >
            <Icon name="tent-fill" size={16} color={colors.onPrimary} />
            <Text
              className="text-[13px] font-medium ml-1"
              style={{
                fontFamily: "Inter",
                color: colors.onPrimary,
              }}
            >
              Form Platoons
            </Text>
          </View>
          <View
            className="flex-row items-center gap-1.5 border px-3.5 py-2"
            style={{
              borderRadius: rounded.full,
              backgroundColor: colors.primary,
              borderColor: colors.outlineVariant,
            }}
          >
            <Icon name="ticket-2-fill" size={16} color={colors.onPrimary} />
            <Text
              className="text-[13px] font-medium ml-1"
              style={{
                fontFamily: "Inter",
                color: colors.onPrimary,
              }}
            >
              Exclusive Deals
            </Text>
          </View>
          <View
            className="flex-row items-center gap-1.5 border px-3.5 py-2"
            style={{
              borderRadius: rounded.full,
              backgroundColor: colors.primary,
              borderColor: colors.outlineVariant,
            }}
          >
            <Icon name="compass-3-fill" size={16} color={colors.onPrimary} />
            <Text
              className="text-[13px] font-medium ml-1"
              style={{
                fontFamily: "Inter",
                color: colors.onPrimary,
              }}
            >
              Curated Trips
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom CTA */}
      <View className="px-7 pb-12 gap-3.5">
        <PillButton
          title="Get Started"
          onPress={() => navigation.navigate(navigation.ROUTES.login)}
          variant="primary"
        />

        <TouchableOpacity
          className="items-center py-2.5"
          activeOpacity={0.7}
          onPress={() => navigation.navigate(navigation.ROUTES.login)}
        >
          <Text
            className="text-base"
            style={{
              fontFamily: "Inter",
              color: colors.onSurfaceVariant,
            }}
          >
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
