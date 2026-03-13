import "./ZoomControls.css";

function TranslocationControls({ onUp, onDown, disabled = false, activeColor }) {
  const activeStyle = !disabled && activeColor ? { color: activeColor } : undefined;
  return (
    <div
      className="zoom-controls"
      style={{ flexDirection: "column" }}
      role="group"
      aria-label="Translocation Controls"
    >
      <button
        className="zoom-btn"
        style={activeStyle}
        onClick={onUp}
        disabled={disabled}
        aria-label="Shift Polylines Upward"
        title="Shift Up"
      >
        <svg width="17" height="17" viewBox="0 0 14 14">
          <line
            x1="7"
            y1="11"
            x2="7"
            y2="3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <polyline
            points="4,6 7,3 10,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        className="zoom-btn"
        style={activeStyle}
        onClick={onDown}
        disabled={disabled}
        aria-label="Shift Polylines Downward"
        title="Shift Down"
      >
        <svg width="17" height="17" viewBox="0 0 14 14">
          <line
            x1="7"
            y1="3"
            x2="7"
            y2="11"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <polyline
            points="4,8 7,11 10,8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default TranslocationControls;
