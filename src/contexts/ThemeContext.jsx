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
    background: "#ffffff",
    nodeDefault: "#4d5561",
    edgeDefaultLine: "#d8dce4",
    edgeDefaultPoint: "#4d5561",
    ksnakesCore: "#c8c8d0",
    ksnakesIsland: "#ffffff",
    hopcensusGridLine: "#e4e8f0",
  },
};

function getLuminosityStrength(value, theme) {
  const minStrength = 0.1;
  const maxStrength = theme === "dark" ? 3.0 : 8.0;
  const t = value / 100;
  if (t <= 0) return minStrength;
  if (t >= 1) return maxStrength;
  const ratio = maxStrength / minStrength;
  const k = Math.log(1 / minStrength) / Math.log(ratio);
  const p = Math.log(k) / Math.log(0.5);
  return minStrength * Math.pow(ratio, Math.pow(t, p));
}

function deriveVisualizationPalette(theme, luminosity) {
  const base = VISUALIZATION_PALETTES[theme];
  const strength = getLuminosityStrength(luminosity, theme);

  const edgeDefaultLine = scaleRelativeColor(
    base.background,
    base.edgeDefaultLine,
    strength,
  );

  return {
    nodeDefault: scaleRelativeColor(
      base.background,
      base.nodeDefault,
      strength,
    ),
    edgeDefaultLine,
    edgeDefaultPoint: scaleRelativeColor(
      base.background,
      base.edgeDefaultPoint,
      strength,
    ),
    ksnakesCore: edgeDefaultLine,
    ksnakesIsland: base.background,
    hopcensusGridLine: scaleRelativeColor(
      base.background,
      base.hopcensusGridLine,
      strength,
    ),
  };
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
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
