import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { ThemeProvider } from "../utils/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from 'react-redux';
import { store } from "../src/store";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCurrentUser, setTokenFromStorage } from "../src/store/slices/authSlice";
import { useAppSelector } from "../src/store/hooks";

function RootApp() {
  const router = useRouter();
  const segments = useSegments();
  const { token, status } = useAppSelector((state) => state.auth);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('jwt_token');
        if (storedToken) {
          store.dispatch(setTokenFromStorage(storedToken));
          store.dispatch(fetchCurrentUser());
        }
      } catch (e) {
        console.error('Failed to load token from storage', e);
      } finally {
        setIsReady(true);
      }
    };

    bootstrapAsync();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup && segments.length > 0) {
      // User is logged out but inside protected group
      router.replace("/(auth)/login");
    } else if (token && (inAuthGroup || segments.length === 0) && status !== "loading") {
      // User is logged in but at index or inside auth
      router.replace("/(tabs)/home");
    }
  }, [token, segments, isReady, status, router]);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="trip/[id]" />
        </Stack>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootApp />
    </Provider>
  );
}
