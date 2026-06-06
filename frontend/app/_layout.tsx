import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { ThemeProvider } from "../utils/theme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from 'react-redux';
import { store } from "../src/store";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCurrentUser, setTokenFromStorage } from "../src/store/slices/authSlice";

function RootApp() {
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt_token');
        if (token) {
          store.dispatch(setTokenFromStorage(token));
          store.dispatch(fetchCurrentUser());
        }
      } catch (e) {
        console.error('Failed to load token from storage', e);
      }
    };

    bootstrapAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
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
