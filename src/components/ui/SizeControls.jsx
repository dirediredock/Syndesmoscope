import './SizeControls.css'

const SIZES = ['S', 'M', 'L']

/**
 * Get the next size in the cycle: S → M → L → S
 */
function getNextSize(current) {
  const idx = SIZES.indexOf(current)
  return SIZES[(idx + 1) % SIZES.length]
}

/**
 * Get full size name for accessibility
 */
function getSizeName(size) {
  return size === 'S' ? 'Small' : size === 'M' ? 'Medium' : 'Large'
}

/**
 * SizeControls - Cycling toggle buttons for node and edge sizes
 *
 * Each button displays an icon + current size letter.
 * Clicking cycles through S → M → L → S...
 */
function SizeControls({
  nodeSize = null,
  edgeSize = null,
  onNodeSizeChange,
  onEdgeSizeChange,
  disabled = false
}) {
  const hasNodeControl = nodeSize !== null && onNodeSizeChange
  const hasEdgeControl = edgeSize !== null && onEdgeSizeChange

  if (!hasNodeControl && !hasEdgeControl) {
    return null
  }

  return (
    <div className="size-controls" role="group" aria-label="Size Controls">
      {hasNodeControl && (
        <button
          className="size-toggle-btn"
          onClick={() => onNodeSizeChange(getNextSize(nodeSize))}
          disabled={disabled}
          aria-label={`Node Size`}
          title={`Node Size`}
        >
          <svg className="size-toggle-icon" width="10" height="10" viewBox="0 0 10 10">
            <circle cx="5" cy="5" r="4" fill="currentColor" />
          </svg>
          <span className="size-toggle-label">{nodeSize}</span>
        </button>
      )}

      {hasNodeControl && hasEdgeControl && (
        <div className="size-divider" />
      )}

      {hasEdgeControl && (
        <button
          className="size-toggle-btn"
          onClick={() => onEdgeSizeChange(getNextSize(edgeSize))}
          disabled={disabled}
          aria-label={`Edge Size`}
          title={`Edge Size`}
        >
          <svg className="size-toggle-icon" width="10" height="10" viewBox="0 0 10 10">
            <line x1="0" y1="5" x2="10" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="size-toggle-label">{edgeSize}</span>
        </button>
      )}
    </div>
  )
}

export default SizeControls
