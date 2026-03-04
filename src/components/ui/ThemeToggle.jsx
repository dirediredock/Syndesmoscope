import { useTheme } from "../../contexts/ThemeContext";
import "./ThemeToggle.css";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch Theme`}
      title={`Switch Theme`}
    >
      {theme === "dark" ? (
        // Moon icon (shown in dark mode)
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6.2 1.1a.7.7 0 0 0-.8.9 5.5 5.5 0 0 0 8.6 8.6.7.7 0 0 0 .9-.8 7 7 0 1 1-8.7-8.7Z" />
        </svg>
      ) : (
        // Sun icon (shown in light mode)
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1ZM3.1 3.1a.75.75 0 0 1 1.06 0l1.06 1.06a.75.75 0 0 1-1.06 1.06L3.1 4.16a.75.75 0 0 1 0-1.06Zm9.8 0a.75.75 0 0 1 0 1.06l-1.06 1.06a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0ZM8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM1 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 1 8Zm11 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 12 8Zm-7.78 3.22a.75.75 0 0 1 1.06 1.06l-1.06 1.06a.75.75 0 1 1-1.06-1.06l1.06-1.06Zm7.56 0 1.06 1.06a.75.75 0 1 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 1.06-1.06ZM8 12a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 12Z" />
        </svg>
      )}
    </button>
  );
}

export default ThemeToggle;
