import ZoomControls from "./ZoomControls";
import SizeControls from "./SizeControls";
import "./Pane.css";

/**
 * Pane is a wrapper component that provides consistent structure
 * for all visualization panes, including:
 * - Scrollable content area
 * - Footer with zoom/size controls
 * - Empty state when no data is loaded
 */

function Pane({
  accentColor,
  children,
  isEmpty = false,
  emptyMessage = "NO DATA",
  zoomControls = null,
  sizeControls = null,
  footerControls = null,
  footerLeftControls = null,
  preZoomControls = null,
  postZoomControls = null,
  headerLeftControls = null,
}) {
  return (
    <div className="pane">
      {(headerLeftControls || zoomControls || preZoomControls || postZoomControls) && !isEmpty && (
        <div className="pane-header" style={{ "--pane-accent": accentColor }}>
          <div className="pane-header-left">
            {headerLeftControls}
          </div>
          <div className="pane-header-right">
            {preZoomControls}
            {zoomControls && <ZoomControls {...zoomControls} />}
            {postZoomControls}
          </div>
        </div>
      )}
      <div className="pane-content">
        {isEmpty ? (
          <div className="pane-empty">
            <span className="pane-empty-text">{emptyMessage}</span>
          </div>
        ) : (
          children
        )}
      </div>
      <div className="pane-footer" style={{ "--pane-accent": accentColor }}>
        <div className="pane-footer-left">
          {sizeControls && !isEmpty && <SizeControls {...sizeControls} />}
          {footerLeftControls && !isEmpty && footerLeftControls}
        </div>
        <div className="pane-footer-right">
          {footerControls && !isEmpty && footerControls}
        </div>
      </div>
    </div>
  );
}

export default Pane;
