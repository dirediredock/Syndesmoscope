import { useState } from "react";
import "./ZoomControls.css";

/**
 * ZoomControls - Reusable zoom control buttons
 *
 * The zoom-level button toggles between fit-to-content and reset zoom
 * when onFitContent is provided. Otherwise it just resets zoom.
 */
function ZoomControls({
  onReset,
  onFitContent,
  zoomPercent = 100,
  disabled = false,
}) {
  const [isFitMode, setIsFitMode] = useState(false);

  const handleClick = () => {
    if (!onFitContent) {
      onReset();
      return;
    }
    if (isFitMode) {
      onReset();
      setIsFitMode(false);
    } else {
      onFitContent();
      setIsFitMode(true);
    }
  };

  const label = onFitContent
    ? isFitMode
      ? "Reset Zoom"
      : "Fit Zoom"
    : "Reset Zoom";

  return (
    <div className="zoom-controls" role="group" aria-label="Zoom Controls">
      <button
        className="zoom-level"
        onClick={handleClick}
        disabled={disabled}
        aria-label={label}
        title={label}
      >
        {zoomPercent}%
      </button>
    </div>
  );
}

export default ZoomControls;
