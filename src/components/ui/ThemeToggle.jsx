import { useTheme } from "../../contexts/ThemeContext";
import "../ui/ControlPanel.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="control-btn-wrap">
      <button
        className="control-icon-btn"
        onClick={toggleTheme}
        aria-label="Switch Theme"
        title="Switch Theme"
      >
        <svg width="20" height="20" viewBox="0 0 16 16">
          {theme === "dark" ? (
            // Dark: split circle, left half filled
            <>
              <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 3 A5 5 0 0 0 8 13 Z" fill="currentColor" />
            </>
          ) : (
            // Light: split circle, right half filled
            <>
              <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 3 A5 5 0 0 1 8 13 Z" fill="currentColor" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

export default ThemeToggle;
