import { View, Text } from "react-native";
import { useTheme } from "../../utils/theme";

export default function PlatoonsScreen() {
  const { colors } = useTheme();
  return (
    <View
      className="flex-1 justify-center items-center"
      style={{ backgroundColor: colors.background }}
    >
      <Text
        style={{
          color: colors.onBackground,
          fontFamily: "Montserrat",
          fontSize: 24,
          fontWeight: "700",
        }}
      >
        Platoons
      </Text>
    </View>
  );
}
