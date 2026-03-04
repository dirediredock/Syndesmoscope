import "./SizeControls.css";

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];

/**
 * Get the next size in the cycle: S → M → L → S
 */
function getNextSize(current, sizes = DEFAULT_SIZES) {
  const idx = sizes.indexOf(current);
  return sizes[(idx + 1) % sizes.length];
}

/**
 * Get full size name for accessibility
 */
function getSizeName(size) {
  const names = {
    XS: "Extra Small",
    S: "Small",
    M: "Medium",
    L: "Large",
    XL: "Extra Large",
    XXL: "Extra Extra Large",
  };
  return names[size] ?? size;
}

/**
 * SizeControls - Cycling toggle buttons for node and edge sizes,
 * plus optional visibility toggles (e.g. gridlines).
 *
 * Each size button displays an icon + current size letter.
 * Clicking cycles through S → M → L → S...
 */
function SizeControls({
  nodeSize = null,
  nodeIcon = null,
  nodeSizeLabel = "Node Size",
  edgeSize = null,
  edgeIcon = null,
  edgeSizeLabel = "Edge Size",
  onNodeSizeChange,
  onEdgeSizeChange,
  sizes = DEFAULT_SIZES,
  gridlinesVisible = null,
  onGridlinesToggle = null,
  disabled = false,
}) {
  const hasNodeControl = nodeSize !== null && onNodeSizeChange;
  const hasEdgeControl = edgeSize !== null && onEdgeSizeChange;
  const hasGridlinesControl = gridlinesVisible !== null && onGridlinesToggle;

  if (!hasNodeControl && !hasEdgeControl && !hasGridlinesControl) {
    return null;
  }

  return (
    <div className="size-controls" role="group" aria-label="Size Controls">
      {hasNodeControl && (
        <button
          className="size-toggle-btn"
          onClick={() => onNodeSizeChange(getNextSize(nodeSize, sizes))}
          disabled={disabled}
          aria-label={nodeSizeLabel}
          title={nodeSizeLabel}
        >
          {nodeIcon || (
            <svg
              className="size-toggle-icon"
              width="14"
              height="14"
              viewBox="0 0 10 10"
            >
              <circle cx="5" cy="5" r="3" fill="currentColor" />
            </svg>
          )}
          <span className="size-toggle-label">{nodeSize}</span>
        </button>
      )}

      {hasNodeControl && hasEdgeControl && <div className="size-divider" />}

      {hasEdgeControl && (
        <button
          className="size-toggle-btn"
          onClick={() => onEdgeSizeChange(getNextSize(edgeSize, sizes))}
          disabled={disabled}
          aria-label={edgeSizeLabel}
          title={edgeSizeLabel}
        >
          {edgeIcon || (
            <svg
              className="size-toggle-icon"
              width="14"
              height="14"
              viewBox="0 0 10 10"
            >
              <line
                x1="2"
                y1="8"
                x2="8"
                y2="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="2" cy="8" r="1.5" fill="currentColor" />
              <circle cx="8" cy="2" r="1.5" fill="currentColor" />
            </svg>
          )}
          <span className="size-toggle-label">{edgeSize}</span>
        </button>
      )}

      {hasGridlinesControl && (hasNodeControl || hasEdgeControl) && (
        <div className="size-divider" />
      )}

      {hasGridlinesControl && (
        <button
          className={`size-toggle-btn${gridlinesVisible ? "" : " size-toggle-btn--off"}`}
          onClick={onGridlinesToggle}
          disabled={disabled}
          aria-label="Toggle Gridlines"
          title={gridlinesVisible ? "Hide gridlines" : "Show gridlines"}
        >
          <svg
            className="size-toggle-icon"
            width="14"
            height="14"
            viewBox="0 0 10 10"
          >
            <line
              x1="0"
              y1="2"
              x2="10"
              y2="2"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
            <line
              x1="0"
              y1="8"
              x2="10"
              y2="8"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
            <line
              x1="2"
              y1="0"
              x2="2"
              y2="10"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
            <line
              x1="8"
              y1="0"
              x2="8"
              y2="10"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SizeControls;
