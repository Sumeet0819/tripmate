import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useAppNavigation } from "../../utils/navigation";
import { useTheme } from "../../utils/theme";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { AuthHeader } from "../../components/AuthHeader";
import { FormInput } from "../../components/FormInput";
import { PillButton } from "../../components/PillButton";
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from "../../src/config/supabase";
import { useAppDispatch, useAppSelector } from "../../src/store/hooks";
import { requestOtp, syncGoogleProfile } from "../../src/store/slices/authSlice";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const navigation = useAppNavigation();
  const { colors } = useTheme();
  const dispatch = useAppDispatch();
  const { otpStatus, status: authStatus } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");

  // Listen for Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Dispatch backend sync when google oauth completes
        const jwt = session.access_token;
        const resultAction = await dispatch(syncGoogleProfile(jwt));
        if (syncGoogleProfile.fulfilled.match(resultAction)) {
          navigation.navigate(navigation.ROUTES.home);
        } else {
          Alert.alert("Login Failed", "Could not sync profile with server.");
        }
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch, navigation]);

  const handleEmailContinue = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    const resultAction = await dispatch(requestOtp(email.trim()));
    if (requestOtp.fulfilled.match(resultAction)) {
      // Navigate to OTP verify screen, passing the email
      navigation.navigate("verify-otp", { email: email.trim() });
    } else {
      Alert.alert("Error", (resultAction.payload as string) || "Failed to send OTP.");
    }
  };

  const handleGoogleSignIn = async () => {
    const redirectUrl = AuthSession.makeRedirectUri();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      Alert.alert("Error", "Failed to start Google sign in.");
    }
    // WebBrowser interaction is handled by Supabase SDK natively if URL is opened,
    // but in some Expo setups, we might need to manually handle the URL.
    // In SDK v2, signInWithOAuth automatically opens the browser in Expo if configured properly.
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
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
                title={otpStatus === 'loading' ? "Sending..." : "Continue"} 
                onPress={handleEmailContinue} 
                variant="white" 
                disabled={otpStatus === 'loading'}
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
              onPress={handleGoogleSignIn}
              variant="google"
              icon="google-fill"
              disabled={authStatus === 'loading'}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
