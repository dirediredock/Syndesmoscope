import ZoomControls from './ZoomControls'
import './Pane.css'

/**
 * Pane is a wrapper component that provides consistent structure
 * for all visualization panes, including:
 * - Header with title and accent color
 * - Optional zoom controls
 * - Scrollable content area
 * - Empty state when no data is loaded
 */

function Pane({
  title,
  accentColor,
  children,
  isEmpty = false,
  emptyMessage = 'NO DATA',
  zoomControls = null
}) {
  return (
    <div className="pane">
      <div className="pane-content">
        {isEmpty ? (
          <div className="pane-empty">
            <span className="pane-empty-text">{emptyMessage}</span>
          </div>
        ) : (
          children
        )}
      </div>
      <div
        className="pane-header"
        style={{ '--pane-accent': accentColor }}
      >
        {/* <div className="pane-header-left">
          <span className="pane-accent-bar" />
          <h2 className="pane-title">{title}</h2>
        </div> */}
        {zoomControls && !isEmpty && (
          <div className="pane-header-right">
            <ZoomControls {...zoomControls} />
          </div>
        )}
      </div>

    </div>
  )
}

export default Pane
