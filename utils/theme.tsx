import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";

// Ported exactly from DESIGN (3).md
export const LIGHT_COLORS = {
  surface: "#ffffff",
  surfaceDim: "#e8ecef",
  surfaceBright: "#ffffff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f4f6f9",
  surfaceContainer: "#e8ecef",
  surfaceContainerHigh: "#dce2e7",
  surfaceContainerHighest: "#d0d8df",
  onSurface: "#121214",
  onSurfaceVariant: "#5e6573",
  inverseSurface: "#121214",
  inverseOnSurface: "#ffffff",
  outline: "#d0d8df",
  outlineVariant: "#bcc6cf",
  surfaceTint: "#1a73e8",
  primary: "#1a73e8", // Vibrant Travel Blue
  onPrimary: "#ffffff",
  primaryContainer: "#e3f2fd", // Soft blue container
  onPrimaryContainer: "#0d47a1",
  inversePrimary: "#90caf9",
  secondary: "#e05a2b", // Premium Suitcase Orange
  onSecondary: "#ffffff",
  secondaryContainer: "#ffebe5",
  onSecondaryContainer: "#c43c00",
  tertiary: "#13677b", // Sea Teal
  onTertiary: "#ffffff",
  tertiaryContainer: "#a1e7ff",
  onTertiaryContainer: "#18697e",
  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  background: "#f4f6f9",
  onBackground: "#121214",
  surfaceVariant: "#e8ecef",
};

// Beautiful dark palette tailored to match the "Vibrant Bharat Explorer" theme
export const DARK_COLORS = {
  surface: "#181a1f",
  surfaceDim: "#121317",
  surfaceBright: "#22252c",
  surfaceContainerLowest: "#0b0c0e",
  surfaceContainerLow: "#14161b",
  surfaceContainer: "#1a1d23",
  surfaceContainerHigh: "#20242b",
  surfaceContainerHighest: "#2c313b",
  onSurface: "#ffffff",
  onSurfaceVariant: "#8c93a3",
  inverseSurface: "#ffffff",
  inverseOnSurface: "#121214",
  outline: "#2c313b",
  outlineVariant: "#3d4452",
  surfaceTint: "#1a73e8",
  primary: "#1a73e8", // Vibrant Travel Blue
  onPrimary: "#ffffff",
  primaryContainer: "#1e2024", // Clean input card background
  onPrimaryContainer: "#ffffff",
  inversePrimary: "#1a73e8",
  secondary: "#e05a2b", // Premium Suitcase Orange
  onSecondary: "#ffffff",
  secondaryContainer: "#2c313b",
  onSecondaryContainer: "#ffffff",
  tertiary: "#8bd1e8",
  onTertiary: "#003541",
  tertiaryContainer: "#13677b",
  onTertiaryContainer: "#b2ebff",
  error: "#ffb4ab",
  onError: "#690005",
  errorContainer: "#93000a",
  onErrorContainer: "#ffdad6",
  background: "#0e1013", // Deep dark background
  onBackground: "#ffffff",
  surfaceVariant: "#2c313b",
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

type ThemeContextType = {
  mode: "light" | "dark";
  colors: typeof LIGHT_COLORS;
  spacing: typeof SPACING;
  rounded: typeof ROUNDED;
  typography: typeof TYPOGRAPHY;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (systemScheme === "dark" || systemScheme === "light") {
      setMode(systemScheme);
    }
  }, [systemScheme]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const themeValue: ThemeContextType = {
    mode,
    colors: mode === "light" ? LIGHT_COLORS : DARK_COLORS,
    spacing: SPACING,
    rounded: ROUNDED,
    typography: TYPOGRAPHY,
    toggleTheme,
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
