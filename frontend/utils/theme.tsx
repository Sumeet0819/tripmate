import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

// Ported exactly from DESIGN (3).md
export const LIGHT_COLORS = {
  surface: "#FFFFFF", // White
  surfaceDim: "#EBEEF2", // Light Gray
  surfaceBright: "#FFFFFF",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#EBEEF2",
  surfaceContainer: "#EBEEF2",
  surfaceContainerHigh: "#d1d5db",
  surfaceContainerHighest: "#6B7077", // Gray
  onSurface: "#2A3544", // Dark Blue
  onSurfaceVariant: "#6B7077", // Gray
  inverseSurface: "#2A3544",
  inverseOnSurface: "#FFFFFF",
  outline: "#6B7077", // Gray
  outlineVariant: "#EBEEF2",
  surfaceTint: "#1E47D1", // Bright Blue
  primary: "#1E47D1", 
  onPrimary: "#FFFFFF",
  primaryContainer: "#e0e7ff",
  onPrimaryContainer: "#0f2368",
  inversePrimary: "#8ea5e8",
  secondary: "#2A3544", // Dark Blue
  onSecondary: "#FFFFFF",
  secondaryContainer: "#EBEEF2", // Light Gray
  onSecondaryContainer: "#2A3544",
  tertiary: "#6B7077", // Gray
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#e5e8eb",
  onTertiaryContainer: "#2A3544",
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  background: "#EBEEF2", // Light Gray
  onBackground: "#2A3544", // Dark Blue
  surfaceVariant: "#EBEEF2",
};

// Beautiful dark palette tailored to match the "Vibrant Bharat Explorer" theme
export const DARK_COLORS = {
  surface: "#2A3544", // Dark Blue
  surfaceDim: "#1f2732",
  surfaceBright: "#354255",
  surfaceContainerLowest: "#151a22",
  surfaceContainerLow: "#2A3544",
  surfaceContainer: "#354255",
  surfaceContainerHigh: "#46566d",
  surfaceContainerHighest: "#6B7077", // Gray
  onSurface: "#FFFFFF", // White
  onSurfaceVariant: "#EBEEF2", // Light Gray
  inverseSurface: "#FFFFFF",
  inverseOnSurface: "#2A3544", // Dark Blue
  outline: "#6B7077", // Gray
  outlineVariant: "#46566d",
  surfaceTint: "#1E47D1", // Bright Blue
  primary: "#1E47D1", 
  onPrimary: "#FFFFFF",
  primaryContainer: "#0f2368", 
  onPrimaryContainer: "#e0e7ff",
  inversePrimary: "#1E47D1",
  secondary: "#EBEEF2", // Light Gray
  onSecondary: "#2A3544", // Dark Blue
  secondaryContainer: "#354255",
  onSecondaryContainer: "#FFFFFF",
  tertiary: "#6B7077", // Gray
  onTertiary: "#2A3544",
  tertiaryContainer: "#354255",
  onTertiaryContainer: "#EBEEF2",
  error: "#ffb4ab",
  onError: "#690005",
  errorContainer: "#93000a",
  onErrorContainer: "#ffdad6",
  background: "#1f2732", // Darker blue background
  onBackground: "#FFFFFF", // White
  surfaceVariant: "#354255",
};

export const SPACING = {
  base: 8,
  xs: 4,
  sm: 12,
  md: 24,
  lg: 40,
  xl: 64,
  gutter: 24,
  marginMobile: 16,
  marginDesktop: 80,
};

export const ROUNDED = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Typography tokens from design markdown
export const TYPOGRAPHY = {
  displayLg: {
    fontFamily: "Montserrat",
    fontSize: 48,
    fontWeight: "700" as const,
    lineHeight: 56,
  },
  displayLgMobile: {
    fontFamily: "Montserrat",
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
  },
  headlineLg: {
    fontFamily: "Montserrat",
    fontSize: 32,
    fontWeight: "700" as const,
    lineHeight: 40,
  },
  headlineLgMobile: {
    fontFamily: "Montserrat",
    fontSize: 24,
    fontWeight: "700" as const,
    lineHeight: 32,
  },
  headlineMd: {
    fontFamily: "Montserrat",
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 32,
  },
  bodyLg: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "400" as const,
    lineHeight: 28,
  },
  bodyMd: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
  },
  labelLg: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "600" as const,
    lineHeight: 20,
  },
  labelMd: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 16,
  },
};

export type ThemePreference = "light" | "dark" | "system";

type ThemeContextType = {
  mode: "light" | "dark"; // The actual active mode
  themePreference: ThemePreference; // The user's preference
  colors: typeof LIGHT_COLORS;
  spacing: typeof SPACING;
  rounded: typeof ROUNDED;
  typography: typeof TYPOGRAPHY;
  setThemePreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>("light"); // Default to light

  // Determine active mode
  const activeMode: "light" | "dark" = 
    themePreference === "system" 
      ? (systemColorScheme === "dark" ? "dark" : "light")
      : themePreference;

  const themeValue: ThemeContextType = {
    mode: activeMode,
    themePreference,
    colors: activeMode === "light" ? LIGHT_COLORS : DARK_COLORS,
    spacing: SPACING,
    rounded: ROUNDED,
    typography: TYPOGRAPHY,
    setThemePreference,
  };

  return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>;
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
