import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAppNavigation } from "../../utils/navigation";
import { useTheme } from "../../utils/theme";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { AuthHeader } from "../../components/AuthHeader";
import { FormInput } from "../../components/FormInput";
import { PillButton } from "../../components/PillButton";

export default function LoginScreen() {
  const navigation = useAppNavigation();
  const { colors } = useTheme();

  const [email, setEmail] = useState("");

  const handleLogin = () => {
    // Централизованная навигация на Home
    navigation.navigate(navigation.ROUTES.home);
  };

  return (
    <View 
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-grow"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Curved illustration Header Card */}
          <AuthHeader activeDotIndex={2} />

          {/* Input Fields Area */}
          <View className="px-6 mt-8">
            <FormInput
              label="Email address"
              placeholder="frieda@gmail.com"
              value={email}
              onChangeText={setEmail}
              icon="mail-line"
              keyboardType="email-address"
            />

            {/* Continue Button */}
            <View className="mt-6">
              <PillButton
                title="Continue"
                onPress={handleLogin}
                variant="white"
              />
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-8 gap-3">
              <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.outline }} />
              <Text 
                className="text-[12px] font-semibold uppercase tracking-widest"
                style={{
                  fontFamily: "Inter",
                  color: colors.onSurfaceVariant,
                }}
              >
                or
              </Text>
              <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.outline }} />
            </View>

            {/* Continue with Google button */}
            <PillButton 
              title="Continue with Google"
              onPress={handleLogin}
              variant="google"
              icon="google-fill"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
