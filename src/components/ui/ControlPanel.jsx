import { useTheme } from "../../contexts/ThemeContext";
import "./ControlPanel.css";

function ControlPanel({ onResetLayout, themeToggle }) {
  const { luminosity, setLuminosity } = useTheme();

  return (
    <div className="control-panel">
      <div className="control-group">
        <span className="control-label">Luminosity:</span>
        <div className="control-slider-wrap">
          <input
            className="control-range"
            type="range"
            min="0"
            max="100"
            step="1"
            value={luminosity}
            onChange={(event) => setLuminosity(Number(event.target.value))}
            aria-label="Visualization luminosity"
          />
          <span className="control-range-value">{luminosity}</span>
        </div>
        {onResetLayout && (
          <div className="control-btn-wrap">
            <button
              className="control-icon-btn"
              onClick={onResetLayout}
              aria-label="Equal Width Panes"
              title="Equal Width Panes"
            >
              <svg width="20" height="20" viewBox="0 0 16 16">
                <polygon points="5,5 5,11 2,8" fill="currentColor" />
                <polygon points="11,5 11,11 14,8" fill="currentColor" />
                <line
                  x1="8"
                  y1="3.5"
                  x2="8"
                  y2="12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}
        {themeToggle}
      </div>
    </div>
  );
}

export default ControlPanel;
