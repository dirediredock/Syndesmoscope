import './ZoomControls.css'

/**
 * ZoomControls - Reusable zoom control buttons
 *
 * Provides +/- zoom, reset, and fit-to-content buttons
 * with keyboard shortcut hints in tooltips.
 */
function ZoomControls({
  onZoomIn,
  onZoomOut,
  onReset,
  onFitContent,
  zoomPercent = 100,
  disabled = false
}) {
  return (
    <div className="zoom-controls" role="group" aria-label="Zoom controls">

      <button
        className="zoom-btn"
        onClick={onFitContent}
        disabled={disabled}
        aria-label="Fit to content"
        title="Fit to content (0)"
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

      <button
        className="zoom-btn"
        onClick={onReset}
        disabled={disabled}
        aria-label="Reset zoom"
        title="Reset view (Home)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14">
          <rect x="2" y="2" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" rx="1" />
        </svg>
      </button>

      <div className="zoom-divider" />

      <button
        className="zoom-btn"
        onClick={onZoomOut}
        disabled={disabled}
        aria-label="Zoom out"
        title="Zoom out (-)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14">
          <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <span className="zoom-level" title="Current zoom level">
        {zoomPercent}%
      </span>

      <button
        className="zoom-btn"
        onClick={onZoomIn}
        disabled={disabled}
        aria-label="Zoom in"
        title="Zoom in (+)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14">
          <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="7" y1="3" x2="7" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>




    </div>
  )
}

export default ZoomControls
