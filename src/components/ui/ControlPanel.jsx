import "./ControlPanel.css";

function ControlPanel({ onResetLayout, themeToggle }) {
  return (
    <div className="control-panel">
      {themeToggle}
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
    </div>
  );
}

export default ControlPanel;
