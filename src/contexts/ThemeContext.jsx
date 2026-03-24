import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getReadableTextColor, scaleRelativeColor } from "../utils/color";

/**
 * ThemeContext manages the application's color theme (light/dark mode).
 *
 * - Applies theme via data-theme attribute on document root
 * - Defaults to 'dark' theme
 */

const ThemeContext = createContext(null);

const DEFAULT_LUMINOSITY = 50;

const VISUALIZATION_PALETTES = {
  dark: {
    background: "#0d1117",
    nodeDefault: "#c8cdd3",
    edgeDefaultLine: "#3c434d",
    edgeDefaultPoint: "#c8cdd3",
    ksnakesCore: "#4d5562",
    ksnakesIsland: "#23232d",
    hopcensusGridLine: "#1e2530",
  },
  light: {
    background: "#eef1f4",
    nodeDefault: "#4d5561",
    edgeDefaultLine: "#d8dce4",
    edgeDefaultPoint: "#4d5561",
    ksnakesCore: "#c8c8d0",
    ksnakesIsland: "#e0e0e8",
    hopcensusGridLine: "#e4e8f0",
  },
};

function getLuminosityStrength(value) {
  if (value <= DEFAULT_LUMINOSITY) {
    return 0.4 + (value / DEFAULT_LUMINOSITY) * 0.6;
  }
  return 1 + ((value - DEFAULT_LUMINOSITY) / DEFAULT_LUMINOSITY) * 0.75;
}

function deriveVisualizationPalette(theme, luminosity) {
  const base = VISUALIZATION_PALETTES[theme];
  const strength = getLuminosityStrength(luminosity);

  return {
    nodeDefault: scaleRelativeColor(base.background, base.nodeDefault, strength),
    edgeDefaultLine: scaleRelativeColor(
      base.background,
      base.edgeDefaultLine,
      strength,
    ),
    edgeDefaultPoint: scaleRelativeColor(
      base.background,
      base.edgeDefaultPoint,
      strength,
    ),
    ksnakesCore: scaleRelativeColor(base.background, base.ksnakesCore, strength),
    ksnakesIsland: scaleRelativeColor(
      base.background,
      base.ksnakesIsland,
      strength,
    ),
    hopcensusGridLine: scaleRelativeColor(
      base.background,
      base.hopcensusGridLine,
      strength,
    ),
  };
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [luminosity, setLuminosity] = useState(DEFAULT_LUMINOSITY);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    const palette = deriveVisualizationPalette(theme, luminosity);
    root.style.setProperty("--color-node-default", palette.nodeDefault);
    root.style.setProperty(
      "--color-edge-default-line",
      palette.edgeDefaultLine,
    );
    root.style.setProperty(
      "--color-edge-default-point",
      palette.edgeDefaultPoint,
    );
    root.style.setProperty("--color-ksnakes-core", palette.ksnakesCore);
    root.style.setProperty("--color-ksnakes-island", palette.ksnakesIsland);
    root.style.setProperty(
      "--color-hopcensus-grid-line",
      palette.hopcensusGridLine,
    );
    root.style.setProperty(
      "--color-node-selected-contrast-text",
      getReadableTextColor(
        getComputedStyle(root).getPropertyValue("--color-node-selected").trim(),
      ),
    );
    root.style.setProperty(
      "--color-edge-selected-contrast-text",
      getReadableTextColor(
        getComputedStyle(root).getPropertyValue("--color-edge-selected").trim(),
      ),
    );
  }, [theme, luminosity]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      luminosity,
      setLuminosity,
      isDark: theme === "dark",
      isLight: theme === "light",
    }),
    [theme, toggleTheme, luminosity],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
