import { useRef, useEffect, useCallback, useState } from 'react'
import * as d3 from 'd3'
import Pane from '../ui/Pane'
import { useSelection } from '../../contexts/SelectionContext'
import { useZoomPan } from '../../hooks/useZoomPan'
import './AdjacencyGridPane.css'

/**
 * AdjacencyGridPane
 *
 * Renders an adjacency matrix from precomputed JSON:
 * - edges[]: points at (x,y) in seriated coordinates, with edge_idx and source/target node ids
 * - node_gridlines[]: per-node seriated_position and recommended start/end extents
 *
 * Interaction:
 * - Hover cell -> hoverEdge(edge_idx) AND hoverNodes([source,target])
 * - Click cell -> toggleEdgeSelection(edge_idx)
 * - Hover gridline -> hoverNode(node_idx)
 * - Click gridline -> toggleNodeSelection(node_idx)
 */

const ACCENT_COLOR = 'var(--color-accent-adjmatrix)'

const CELL_SIZES = {
  XS: { default: 0.5, highlighted: 1   },
  S:  { default: 1,   highlighted: 2   },
  M:  { default: 2,   highlighted: 3   },
  L:  { default: 4,   highlighted: 5   },
  XL: { default: 6,   highlighted: 7   }
}
const GRID_SIZES = {
  XS: { default: 1,   highlighted: 1   },
  S:  { default: 2,   highlighted: 2   },
  M:  { default: 3,   highlighted: 3   },
  L:  { default: 5,   highlighted: 5   },
  XL: { default: 8,   highlighted: 8   }
}
const GRIDLINE_CYCLE = ['off', 'XS', 'S', 'M', 'L', 'XL']

function AdjacencyGridPane({ data, networkName }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const zoomContainerRef = useRef(null)
  const boundsRef = useRef(null)
  const brushGroupRef = useRef(null)

  const [nodeSize, setNodeSize] = useState('M')
  const [gridlines, setGridlines] = useState('off')
  const [brushMode, setBrushMode] = useState(false)

  const {
    hoveredNodes,
    hoveredEdges,
    selectedNodes,
    selectedEdges,
    hoverNode,
    hoverNodes,
    hoverEdge,
    clearHover,
    toggleNodeSelection,
    toggleEdgeSelection,
    selectEdges,
    brushResetSignal
  } = useSelection()

  const handleSelectIntersectionEdges = useCallback(() => {
    if (!data || selectedNodes.size === 0) return
    const intersectionEdgeIdxs = data.edges
      .filter(e => selectedNodes.has(e.source_node_idx) && selectedNodes.has(e.target_node_idx))
      .map(e => e.edge_idx)
    selectEdges(intersectionEdgeIdxs)
  }, [data, selectedNodes, selectEdges])

  const {
    transform,
    resetZoom,
    setFilter,
    zoomPercent
  } = useZoomPan(svgRef, { scaleExtent: [0.5, 15] })

  // Deactivate brush when selection is cleared from control strip
  useEffect(() => {
    if (brushResetSignal > 0) setBrushMode(false)
  }, [brushResetSignal])

  useEffect(() => {
    if (!setFilter) return
    setFilter((event) => {
      if (event.type === 'wheel') return true
      if (brushMode) return false
      const t = event.target
      if (t?.classList?.contains('matrix-cell')) return false
      if (t?.classList?.contains('matrix-gridline-hit')) return false
      return true
    })
  }, [setFilter, brushMode])

  // Toggle brush overlay pointer-events based on brushMode
  useEffect(() => {
    if (!brushGroupRef.current) return
    const bg = d3.select(brushGroupRef.current)
    if (brushMode) {
      bg.style('pointer-events', 'all')
      bg.select('.overlay').style('pointer-events', 'all').style('cursor', 'crosshair')
    } else {
      bg.style('pointer-events', 'none')
      bg.select('.overlay').style('pointer-events', 'none').style('cursor', 'default')
    }
  }, [brushMode])

  useEffect(() => {
    if (zoomContainerRef.current) {
      d3.select(zoomContainerRef.current).attr('transform', transform)
    }
  }, [transform])

  const handleResetZoom = useCallback(() => {
    resetZoom(boundsRef.current)
  }, [resetZoom])

  useEffect(() => {
    handleResetZoom()
    setNodeSize('M')
    setGridlines('off')
  }, [data, handleResetZoom])

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const resizeObserver = new ResizeObserver(() => {
      d3.select(container).selectAll('*').remove()
      if (containerRef.current && data) {
        initializeVisualization()
        setTimeout(() => handleResetZoom(), 100)
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [data, handleResetZoom])

  const applyMatrixStyles = useCallback(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)

    const cellSizes = CELL_SIZES[nodeSize]
    const gridSizes = gridlines !== 'off' ? GRID_SIZES[gridlines] : null

    // Cells (edges)
    svg.selectAll('.matrix-cell')
      .attr('fill', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx)) return 'var(--color-edge-selected)'
        if (hoveredEdges.has(edgeIdx)) return 'var(--color-edge-hover)'
        return 'var(--color-text-muted)'
      })
      .attr('opacity', 1)
      .attr('r', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx) || hoveredEdges.has(edgeIdx)) return cellSizes.highlighted
        return cellSizes.default
      })

    // Gridlines (nodes)
    if (gridSizes) {
      svg.selectAll('.matrix-gridline')
        .attr('stroke', function () {
          const nodeIdx = +d3.select(this).attr('data-node-idx')
          if (selectedNodes.has(nodeIdx)) return 'var(--color-node-selected)'
          if (hoveredNodes.has(nodeIdx)) return 'var(--color-node-hover)'
          return 'var(--color-border)'
        })
        .attr('stroke-width', function () {
          const nodeIdx = +d3.select(this).attr('data-node-idx')
          if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return gridSizes.highlighted
          return gridSizes.default
        })
        .attr('opacity', function () {
          const nodeIdx = +d3.select(this).attr('data-node-idx')
          if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return 0.35
          return 0.12
        })
    }
  }, [nodeSize, gridlines, hoveredNodes, hoveredEdges, selectedNodes, selectedEdges])

  const initializeVisualization = useCallback(() => {
    if (!containerRef.current || !data?.edges || !data?.node_gridlines) return

    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()
    if (width === 0 || height === 0) return

    d3.select(container).selectAll('*').remove()

    const size = Math.min(width, height)
    const margin = {
      top: size * 0.05,
      right: size * 0.05,
      bottom: size * 0.05,
      left: size * 0.05
    }
    const innerWidth = size - margin.left - margin.right
    const innerHeight = size - margin.top - margin.bottom

    // Center square content in viewport
    const preOffsetX = (width - size) / 2
    const preOffsetY = (height - size) / 2

    boundsRef.current = {
      x: preOffsetX + margin.left,
      y: preOffsetY + margin.top,
      width: innerWidth,
      height: innerHeight
    }

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('width', '100%')
      .style('height', '100%')

    svgRef.current = svg.node()

    const zoomContainer = svg.append('g')
      .attr('class', 'zoom-container')

    zoomContainerRef.current = zoomContainer.node()

    const contentGroup = zoomContainer.append('g')
      .attr('class', 'content')
      .attr('transform', `translate(${preOffsetX + margin.left},${preOffsetY + margin.top})`)

    const posMin = d3.min(data.node_gridlines, d => d.seriated_position)
    const posMax = d3.max(data.node_gridlines, d => d.seriated_position)

    const xScale = d3.scaleLinear().domain([posMin - 1, posMax + 1]).range([0, innerWidth])
    const yScale = d3.scaleLinear().domain([posMin - 1, posMax + 1]).range([0, innerHeight])

    const gridGroup = contentGroup.append('g').attr('class', 'matrix-grid')

    gridGroup.selectAll('.matrix-gridline-row')
      .data(data.node_gridlines)
      .join('line')
      .attr('class', 'matrix-gridline matrix-gridline-row')
      .attr('data-node-idx', d => d.node_idx)
      .attr('x1', xScale(posMin - 1))
      .attr('x2', xScale(posMax + 1))
      .attr('y1', d => yScale(d.seriated_position))
      .attr('y2', d => yScale(d.seriated_position))

    gridGroup.selectAll('.matrix-gridline-col')
      .data(data.node_gridlines)
      .join('line')
      .attr('class', 'matrix-gridline matrix-gridline-col')
      .attr('data-node-idx', d => d.node_idx)
      .attr('x1', d => xScale(d.seriated_position))
      .attr('x2', d => xScale(d.seriated_position))
      .attr('y1', yScale(posMin - 1))
      .attr('y2', yScale(posMax + 1))

    const gridHitGroup = contentGroup.append('g').attr('class', 'matrix-grid-hits')

    gridHitGroup.selectAll('.matrix-gridline-hit-row')
      .data(data.node_gridlines)
      .join('line')
      .attr('class', 'matrix-gridline-hit matrix-gridline-hit-row')
      .attr('data-node-idx', d => d.node_idx)
      .attr('x1', xScale(posMin - 1))
      .attr('x2', xScale(posMax + 1))
      .attr('y1', d => yScale(d.seriated_position))
      .attr('y2', d => yScale(d.seriated_position))
      .on('mouseenter', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        hoverNode(nodeIdx)
      })
      .on('mouseleave', clearHover)
      .on('click', function (event) {
        event.stopPropagation()
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        toggleNodeSelection(nodeIdx)
      })

    gridHitGroup.selectAll('.matrix-gridline-hit-col')
      .data(data.node_gridlines)
      .join('line')
      .attr('class', 'matrix-gridline-hit matrix-gridline-hit-col')
      .attr('data-node-idx', d => d.node_idx)
      .attr('x1', d => xScale(d.seriated_position))
      .attr('x2', d => xScale(d.seriated_position))
      .attr('y1', yScale(posMin - 0.5))
      .attr('y2', yScale(posMax + 0.5))
      .on('mouseenter', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        hoverNode(nodeIdx)
      })
      .on('mouseleave', clearHover)
      .on('click', function (event) {
        event.stopPropagation()
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        toggleNodeSelection(nodeIdx)
      })

    const cellsGroup = contentGroup.append('g').attr('class', 'matrix-cells')

    cellsGroup.selectAll('.matrix-cell')
      .data(data.edges)
      .join('circle')
      .attr('class', 'matrix-cell')
      .attr('data-edge-idx', d => d.edge_idx)
      .attr('data-source-node-idx', d => d.source_node_idx)
      .attr('data-target-node-idx', d => d.target_node_idx)
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .on('mouseenter', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        const s = +d3.select(this).attr('data-source-node-idx')
        const t = +d3.select(this).attr('data-target-node-idx')
        hoverEdge(edgeIdx)
        if (hoverNodes) hoverNodes([s, t])
      })
      .on('mouseleave', clearHover)
      .on('click', function (event) {
        event.stopPropagation()
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        toggleEdgeSelection(edgeIdx)
      })

    // Create brush overlay (on top of zoom container so it intercepts events)
    const brushGroup = svg.append('g').attr('class', 'adj-brush-group')
    brushGroupRef.current = brushGroup.node()

    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on('end', (event) => {
        if (!event.selection) return
        const [[bx0, by0], [bx1, by1]] = event.selection

        const matched = []
        const svgNode = svg.node()
        svg.selectAll('.matrix-cell').each(function () {
          const circle = this
          const ctm = circle.getCTM()
          const svgPt = svgNode.createSVGPoint()
          svgPt.x = +circle.getAttribute('cx')
          svgPt.y = +circle.getAttribute('cy')
          const screen = svgPt.matrixTransform(ctm)
          if (screen.x >= bx0 && screen.x <= bx1 && screen.y >= by0 && screen.y <= by1) {
            matched.push(+d3.select(this).attr('data-edge-idx'))
          }
        })

        brushGroup.call(brush.move, null)

        if (matched.length > 0) {
          selectEdges(matched)
        }
      })

    brushGroup.call(brush)
    brushGroup.style('pointer-events', 'none')
    brushGroup.select('.overlay').style('pointer-events', 'none').style('cursor', 'default')

      applyMatrixStyles()
  }, [data, hoverNode, hoverNodes, hoverEdge, clearHover, toggleNodeSelection, toggleEdgeSelection, selectEdges])

  // Initial render + auto-center
  useEffect(() => {
    initializeVisualization()
    const centerTimeout = setTimeout(() => handleResetZoom(), 100)
    return () => clearTimeout(centerTimeout)
  }, [data, initializeVisualization, handleResetZoom])

  // Update visuals (gridlines + cells) on hover/selection + size
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const cellSizes = CELL_SIZES[nodeSize]
    const gridSizes = gridlines !== 'off' ? GRID_SIZES[gridlines] : null

    // Cells (edges)
    svg.selectAll('.matrix-cell')
      .attr('fill', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx)) return 'var(--color-edge-selected)'
        if (hoveredEdges.has(edgeIdx)) return 'var(--color-edge-hover)'
        return 'var(--color-text-muted)'
      })
      .attr('opacity', 1)
      .attr('r', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx) || hoveredEdges.has(edgeIdx)) return cellSizes.highlighted
        return cellSizes.default
      })
      .each(function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx) || hoveredEdges.has(edgeIdx)) d3.select(this).raise()
      })

    // Gridlines visibility
    svg.selectAll('.matrix-gridline')
      .attr('display', gridlines !== 'off' ? null : 'none')
    svg.selectAll('.matrix-gridline-hit')
      .attr('pointer-events', gridlines !== 'off' ? null : 'none')

    // Gridlines (nodes) styling
    if (gridSizes) {
      svg.selectAll('.matrix-gridline')
        .attr('stroke', function () {
          const nodeIdx = +d3.select(this).attr('data-node-idx')
          if (selectedNodes.has(nodeIdx)) return 'var(--color-node-selected)'
          if (hoveredNodes.has(nodeIdx)) return 'var(--color-node-hover)'
          return 'var(--color-border)'
        })
        .attr('stroke-width', function () {
          const nodeIdx = +d3.select(this).attr('data-node-idx')
          if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return gridSizes.highlighted
          return gridSizes.default
        })
        .attr('opacity', function () {
          const nodeIdx = +d3.select(this).attr('data-node-idx')
          if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return 0.45
          return 0.12
        })
        .each(function () {
          const nodeIdx = +d3.select(this).attr('data-node-idx')
          if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) d3.select(this).raise()
        })
    }

  }, [hoveredNodes, hoveredEdges, selectedNodes, selectedEdges, nodeSize, gridlines])

  return (
    <Pane
      title="Adjacency Grid"
      accentColor={ACCENT_COLOR}
      isEmpty={!data}
      zoomControls={{
        onReset: handleResetZoom,
        zoomPercent
      }}
      footerControls={
        <>
          <div className="zoom-controls" role="group" aria-label="Brush">
            <button
              className={`zoom-btn adj-brush-btn${brushMode ? ' zoom-btn--active' : ' zoom-btn--off'}`}
              onClick={() => setBrushMode(b => !b)}
              aria-label="Brush"
              title="Brush"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <rect x="2" y="2" width="10" height="5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="5.5" y="7" width="3" height="5" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          <div className="zoom-controls" role="group" aria-label="Select Intersection Edges">
            <button
              className={`zoom-btn${selectedNodes.size > 0 ? '' : ' zoom-btn--off'}`}
              style={selectedNodes.size > 0 ? { color: 'var(--color-edge-selected)' } : undefined}
              onClick={handleSelectIntersectionEdges}
              disabled={selectedNodes.size === 0}
              aria-label="All Intersection Edges"
              title="All Intersection Edges"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <line x1="7" y1="0" x2="7" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1="7" x2="14" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="7" cy="7" r="3.5" fill="currentColor" />
              </svg>
            </button>
          </div>
          <div className="size-controls" role="group" aria-label="Gridlines">
            <button
              className={`size-toggle-btn${gridlines === 'off' ? ' size-toggle-btn--off' : ''}`}
              style={gridlines !== 'off' ? { color: 'var(--color-node-selected)' } : undefined}
              onClick={() => {
                const idx = GRIDLINE_CYCLE.indexOf(gridlines)
                setGridlines(GRIDLINE_CYCLE[(idx + 1) % GRIDLINE_CYCLE.length])
              }}
              aria-label="Node Gridlines"
              title={gridlines === 'off' ? 'Node Gridlines' : `Node Gridlines: ${gridlines}`}
            >
              <svg className="size-toggle-icon" width="14" height="14" viewBox="0 0 14 14">
                <line x1="0" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="0" y1="9" x2="14" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="5" y1="0" x2="5" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="9" y1="0" x2="9" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {gridlines !== 'off' && <span className="size-toggle-label">{gridlines}</span>}
            </button>
          </div>
        </>
      }
      sizeControls={{
        nodeSize,
        nodeSizeLabel: 'Edge Point Size',
        onNodeSizeChange: setNodeSize
      }}
    >
      <div
        ref={containerRef}
        className="pane-visualization"
        role="img"
      />
    </Pane>
  )
}

export default AdjacencyGridPane

