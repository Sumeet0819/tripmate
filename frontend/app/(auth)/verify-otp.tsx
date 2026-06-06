import { View, Text, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import Icon from "react-native-remix-icon";
import { useAppNavigation } from "../../utils/navigation";
import { useTheme } from "../../utils/theme";
import { hexToRgba } from "../../utils/colors";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { FormInput } from "../../components/FormInput";
import { PillButton } from "../../components/PillButton";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { verifyOtp } from "../../src/store/slices/authSlice";

export default function VerifyOtpScreen() {
  const navigation = useAppNavigation();
  const { colors, mode, rounded } = useTheme();
  const params = useLocalSearchParams();
  const email = params.email as string || "";

  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);

  const [code, setCode] = useState("");

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      Alert.alert("Invalid Code", "Please enter a valid 6-digit OTP.");
      return;
    }

    const resultAction = await dispatch(verifyOtp({ email, code }));
    if (verifyOtp.fulfilled.match(resultAction)) {
      navigation.navigate(navigation.ROUTES.home);
    } else {
      Alert.alert("Verification Failed", (resultAction.payload as string) || "Invalid OTP");
    }
  };

  return (
    <View
      className="flex-1 px-6"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar style={mode === "light" ? "dark" : "light"} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-grow"
          contentContainerStyle={{ paddingBottom: 40, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center">
            <View
              className="w-16 h-16 items-center justify-center mb-6 mt-12"
              style={{
                borderRadius: rounded.full,
                backgroundColor: hexToRgba(colors.primary, 0.1),
              }}
            >
              <Icon name="shield-keyhole-fill" size={32} color={colors.primary} />
            </View>

            <Text
              className="text-2xl font-extrabold mb-2 text-center"
              style={{
                fontFamily: "Montserrat",
                color: colors.onBackground,
              }}
            >
              Verify OTP
            </Text>

            <Text
              className="text-center mb-8 text-sm"
              style={{
                fontFamily: "Inter",
                color: colors.onSurfaceVariant,
              }}
            >
              Enter the 6-digit verification code sent to {email || "your email"}.
            </Text>
          </View>

          <FormInput
            label="Verification Code"
            placeholder="000000"
            value={code}
            onChangeText={setCode}
            icon="key-2-line"
            keyboardType="number-pad"
            maxLength={6}
          />

          <View className="mt-8">
            <PillButton 
              title={status === 'loading' ? "Verifying..." : "Verify Code"} 
              onPress={handleVerify} 
              disabled={status === 'loading'}
            />
          </View>

          <TouchableOpacity
            className="w-full py-4 items-center mt-4"
            activeOpacity={0.85}
            onPress={() => navigation.back()}
          >
            <Text
              className="font-bold text-base"
              style={{
                fontFamily: "Montserrat",
                color: colors.onSurfaceVariant,
              }}
            >
              Go Back
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
