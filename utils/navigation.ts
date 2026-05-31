import { useNavigation } from "expo-router";

export const ROUTES = {
  index: "index",
  onboarding: "onboarding",
  login: "login",
  register: "register",
  verifyOtp: "verify-otp",
  home: "(tabs)",
} as const;

export const ROUTE_PATHS = {
  index: "/",
  onboarding: "/(auth)/onboarding",
  login: "/(auth)/login",
  register: "/(auth)/register",
  verifyOtp: "/(auth)/verify-otp",
  home: "/(tabs)/home",
} as const;

export type RouteType = typeof ROUTES[keyof typeof ROUTES];

export function useAppNavigation() {
  // Use React Navigation's native hook directly as requested
  const navigation = useNavigation<any>();

  return {
    navigate: (route: RouteType) => {
      navigation.navigate(route);
    },
    push: (route: RouteType) => {
      if (typeof navigation.push === "function") {
        navigation.push(route);
      } else {
        navigation.navigate(route);
      }
    },
    replace: (route: RouteType) => {
      if (typeof navigation.replace === "function") {
        navigation.replace(route);
      } else {
        navigation.navigate(route);
      }
    },
    back: () => {
      navigation.goBack();
    },
    ROUTES,
    ROUTE_PATHS,
  };
}
