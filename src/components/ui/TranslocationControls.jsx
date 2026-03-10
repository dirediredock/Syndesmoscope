import "./ZoomControls.css";

function TranslocationControls({ onUp, onDown, disabled = false }) {
  return (
    <div
      className="zoom-controls"
      style={{ flexDirection: "column" }}
      role="group"
      aria-label="Translocation Controls"
    >
      <button
        className="zoom-btn"
        onClick={onUp}
        disabled={disabled}
        aria-label="Shift Polylines Upward"
        title="Shift Up"
      >
        <svg width="14" height="14" viewBox="0 0 14 14">
          <line
            x1="7"
            y1="11"
            x2="7"
            y2="3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <polyline
            points="4,6 7,3 10,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        className="zoom-btn"
        onClick={onDown}
        disabled={disabled}
        aria-label="Shift Polylines Downward"
        title="Shift Down"
      >
        <svg width="14" height="14" viewBox="0 0 14 14">
          <line
            x1="7"
            y1="3"
            x2="7"
            y2="11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <polyline
            points="4,8 7,11 10,8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default TranslocationControls;
