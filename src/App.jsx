import { useRef, useState, useCallback, useEffect } from "react";
import { SelectionProvider } from "./contexts/SelectionContext";
import { NetworkProvider, useNetwork } from "./contexts/NetworkContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ControlPanel from "./components/ui/ControlPanel";
import NetworkSelect from "./components/ui/NetworkSelect";
import NetworkInfo from "./components/ui/NetworkInfo";
import SelectControls from "./components/ui/SelectControls";
import ThemeToggle from "./components/ui/ThemeToggle";
import PaneLayout from "./components/PaneLayout";
import useIsPortrait from "./hooks/useIsPortrait";
import "./App.css";

const DEFAULT_PANE_TYPES = [
  "kSnakes",
  "hopCensus",
  "nodeLink",
  "adjacencyGrid",
];

function AppContent() {
  useEffect(() => {
    const preventBrowserZoom = (e) => {
      if (e.ctrlKey) e.preventDefault();
    };
    window.addEventListener("wheel", preventBrowserZoom, { passive: false });
    return () => window.removeEventListener("wheel", preventBrowserZoom);
  }, []);

  const resetLayoutRef = useRef(null);
  const [paneTypes, setPaneTypes] = useState(DEFAULT_PANE_TYPES);
  const [activePane, setActivePane] = useState(2);
  const { isLoading, error } = useNetwork();
  const isPortrait = useIsPortrait();

  const handlePaneTypeChange = useCallback((panelIndex, newType) => {
    setPaneTypes((prev) => {
      const next = [...prev];
      next[panelIndex] = newType;
      return next;
    });
  }, []);

  return (
    <div className="app">
      {isPortrait ? (
        <header className="app-header app-header--portrait">
          <div className="app-header-row">
            <NetworkSelect isPortrait />
            <div style={{ flex: 1 }} />
            <ThemeToggle />
          </div>
          <div className="app-header-row">
            <SelectControls />
            <NetworkInfo />
          </div>
        </header>
      ) : (
        <header className="app-header">
          <div className="app-title">
            <a
              href="https://github.com/dirediredock/Syndesmoscope"
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={(e) => {
                const color =
                  Math.random() < 0.5
                    ? "var(--color-node-selected)"
                    : "var(--color-edge-selected)";
                e.currentTarget.style.textShadow = `0 0 12px ${color}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textShadow = "";
              }}
            >
              <h1>S Y N D E S M O S C O P E</h1>
            </a>
          </div>
          <SelectControls />
          <NetworkInfo />
          <div className="app-header-spacer">
            {isLoading && <span className="control-status">L O A D I N G</span>}
            {error && <span className="control-status">{error}</span>}
          </div>
          <NetworkSelect />
          <ControlPanel
            onResetLayout={() => resetLayoutRef.current?.()}
            themeToggle={<ThemeToggle />}
          />
        </header>
      )}
      <main className="app-main">
        <PaneLayout
          onResetRef={resetLayoutRef}
          paneTypes={paneTypes}
          onPaneTypeChange={handlePaneTypeChange}
          isPortrait={isPortrait}
          activePaneIndex={activePane}
          onActivePaneChange={setActivePane}
        />
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NetworkProvider>
        <SelectionProvider>
          <AppContent />
        </SelectionProvider>
      </NetworkProvider>
    </ThemeProvider>
  );
}

export default App;
