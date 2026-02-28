import './ZoomControls.css'

/**
 * ZoomControls - Reusable zoom control buttons
 *
 * Provides +/- zoom, reset, and fit-to-content buttons
 * with keyboard shortcut hints in tooltips.
 */
function ZoomControls({
  onReset,
  onFitContent,
  zoomPercent = 100,
  disabled = false
}) {
  return (
    <div className="zoom-controls" role="group" aria-label="Zoom Controls">

      {onFitContent && (
        <button
          className="zoom-btn"
          onClick={onFitContent}
          disabled={disabled}
          aria-label="Fit Zoom"
          title="Fit Zoom"
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M2 5V3a1 1 0 011-1h2M9 2h2a1 1 0 011 1v2M12 9v2a1 1 0 01-1 1h-2M5 12H3a1 1 0 01-1-1V9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      <button
        className="zoom-level"
        onClick={onReset}
        disabled={disabled}
        aria-label="Reset Zoom"
        title="Reset Zoom"
      >
        {zoomPercent}%
      </button>




    </div>
  )
}

export default ZoomControls
