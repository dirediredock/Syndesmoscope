import ZoomControls from "./ZoomControls";
import SizeControls from "./SizeControls";
import { useSelection } from "../../contexts/SelectionContext";
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
  preZoomControls = null,
  postZoomControls = null,
}) {
  const { hoveredNodes, hoveredEdges } = useSelection();

  const hoveredNodeList = [...hoveredNodes];
  const hoveredEdgeList = [...hoveredEdges];
  const showHoverInfo =
    !isEmpty && (hoveredNodeList.length > 0 || hoveredEdgeList.length > 0);

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
        {/* {showHoverInfo && (
          <div className="pane-hover-info">
            {hoveredNodeList.map(idx => (
              <span key={`n${idx}`} className="pane-hover-node">{idx}</span>
            ))}
            {hoveredEdgeList.map(idx => (
              <span key={`e${idx}`} className="pane-hover-edge">{idx}</span>
            ))}
          </div>
        )} */}
      </div>
      {(zoomControls || preZoomControls || postZoomControls) && !isEmpty && (
        <div
          className="pane-header-right"
          style={{ "--pane-accent": accentColor }}
        >
          {preZoomControls}
          {zoomControls && <ZoomControls {...zoomControls} />}
          {postZoomControls}
        </div>
      )}
      <div className="pane-footer" style={{ "--pane-accent": accentColor }}>
        <div className="pane-footer-left">
          {sizeControls && !isEmpty && <SizeControls {...sizeControls} />}
        </div>
        <div className="pane-footer-right">
          {footerControls && !isEmpty && footerControls}
        </div>
      </div>
    </div>
  );
}

export default Pane;
