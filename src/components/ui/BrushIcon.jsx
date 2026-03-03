/**
 * BrushIcon - Paint roller glyph for brush selection toggle.
 * Shared across panes that support brush selection.
 */
function BrushIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14">
      {/* Roller head */}
      <rect x="1.5" y="1.5" width="11" height="4" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      {/* Handle stem */}
      <line x1="7" y1="6" x2="7" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      {/* Handle grip */}
      <rect x="5.8" y="9" width="2.5" height="4.5" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export default BrushIcon
