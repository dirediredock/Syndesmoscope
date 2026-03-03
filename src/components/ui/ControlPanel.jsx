import './ControlPanel.css'

const PANE_TYPE_CYCLE = ['kSnakes', 'hopCensus', 'nodeLink', 'adjacencyGrid']
const PANE_TYPE_LABELS = {
  kSnakes: 'kSnakes',
  hopCensus: 'HopCensus',
  nodeLink: 'NodeLink',
  adjacencyGrid: 'AdjacencyGrid'
}

function ControlPanel({ paneTypes, onPaneTypeChange, onResetLayout }) {
  return (
    <div className="control-panel">
      {paneTypes && onPaneTypeChange && (
        <div className="control-group">
          <label className="control-label">Panes:</label>
          <div className="pane-type-group">
            {paneTypes.map((type, idx) => (
              <button
                key={idx}
                className="pane-type-btn"
                onClick={() => {
                  const cycleIdx = PANE_TYPE_CYCLE.indexOf(type)
                  const next = PANE_TYPE_CYCLE[(cycleIdx + 1) % PANE_TYPE_CYCLE.length]
                  onPaneTypeChange(idx, next)
                }}
                aria-label={`Pane ${idx + 1}`}
                title={`Pane ${idx + 1}`}
              >
                {PANE_TYPE_LABELS[type] || type}
              </button>
            ))}
          </div>
        </div>
      )}

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
              <line x1="8" y1="3.5" x2="8" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default ControlPanel
