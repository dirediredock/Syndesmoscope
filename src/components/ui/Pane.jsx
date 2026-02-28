import ZoomControls from './ZoomControls'
import SizeControls from './SizeControls'
import { useSelection } from '../../contexts/SelectionContext'
import './Pane.css'

/**
 * Pane is a wrapper component that provides consistent structure
 * for all visualization panes, including:
 * - Header with title and accent color
 * - Optional zoom controls
 * - Optional size controls (for node/edge sizes)
 * - Scrollable content area
 * - Empty state when no data is loaded
 */

function Pane({
  title,
  accentColor,
  children,
  isEmpty = false,
  emptyMessage = 'NO DATA',
  zoomControls = null,
  sizeControls = null,
  headerControls = null,
  preZoomControls = null,
  postZoomControls = null
}) {
  const { hoveredNodes, hoveredEdges } = useSelection()

  const hoveredNodeList = [...hoveredNodes]
  const hoveredEdgeList = [...hoveredEdges]
  const showHoverInfo = !isEmpty && (hoveredNodeList.length > 0 || hoveredEdgeList.length > 0)

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
        {showHoverInfo && (
          <div className="pane-hover-info">
            {hoveredNodeList.map(idx => (
              <span key={`n${idx}`} className="pane-hover-node">{idx}</span>
            ))}
            {hoveredEdgeList.map(idx => (
              <span key={`e${idx}`} className="pane-hover-edge">{idx}</span>
            ))}
          </div>
        )}
      </div>
      <div
        className="pane-header"
        style={{ '--pane-accent': accentColor }}
      >
        <div className="pane-header-left">
          {headerControls && !isEmpty && headerControls}
        </div>
        <div className="pane-header-right">
          {preZoomControls && !isEmpty && preZoomControls}
          {sizeControls && !isEmpty && <SizeControls {...sizeControls} />}
          {zoomControls && !isEmpty && <ZoomControls {...zoomControls} />}
          {postZoomControls && !isEmpty && postZoomControls}
        </div>
      </div>

    </div>
  )
}

export default Pane
