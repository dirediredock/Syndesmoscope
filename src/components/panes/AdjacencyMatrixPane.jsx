import { useRef, useEffect, useCallback, useState } from 'react'
import * as d3 from 'd3'
import Pane from '../ui/Pane'
import { useSelection } from '../../contexts/SelectionContext'
import { useZoomPan } from '../../hooks/useZoomPan'
import { useShiftPanCursor } from '../../hooks/useShiftPanCursor'
import './AdjacencyMatrixPane.css'

/**
 * AdjacencyMatrixPane
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
  S: { default: 0.6, highlighted: 2.2 },
  M: { default: 1.6, highlighted: 4.2 },
  L: { default: 3.4, highlighted: 7.0 }
}

const GRID_SIZES = {
  S: { default: 1, highlighted: 2 },
  M: { default: 3, highlighted: 6 },
  L: { default: 6, highlighted: 10 }
}

function AdjacencyMatrixPane({ data, networkName }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const zoomContainerRef = useRef(null)
  const boundsRef = useRef(null)

  const [nodeSize, setNodeSize] = useState('M')
  const [edgeSize, setEdgeSize] = useState('M')
  const [renderVersion, setRenderVersion] = useState(0)

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
    selectNodes,
    selectEdges
  } = useSelection()

  const {
    transform,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContent,
    setFilter,
    zoomPercent
  } = useZoomPan(svgRef, { scaleExtent: [0.5, 9.99] })

  useShiftPanCursor(containerRef)

  useEffect(() => {
    if (!setFilter) return
    setFilter((event) => {
      if (event.type === 'wheel') return true
      return !!event.shiftKey
    })
  }, [setFilter])

  useEffect(() => {
    if (zoomContainerRef.current) {
      d3.select(zoomContainerRef.current).attr('transform', transform)
    }
  }, [transform])

  useEffect(() => {
    resetZoom()
    setNodeSize('M')
    setEdgeSize('M')
  }, [data, resetZoom])

  const handleFitContent = useCallback(() => {
    if (boundsRef.current) fitToContent(boundsRef.current)
  }, [fitToContent])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleKeyDown = (event) => {
      if (document.activeElement !== container) return

      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault()
          zoomIn()
          break
        case '-':
          event.preventDefault()
          zoomOut()
          break
        case 'Home':
          event.preventDefault()
          resetZoom()
          break
        case '0':
          event.preventDefault()
          handleFitContent()
          break
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [zoomIn, zoomOut, resetZoom, handleFitContent])

  useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current

    const resizeObserver = new ResizeObserver(() => {
      d3.select(container).selectAll('*').remove()
      if (containerRef.current && data) {
        initializeVisualization()
        setTimeout(() => handleFitContent(), 100)
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [data, handleFitContent])

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

    boundsRef.current = {
      x: margin.left,
      y: margin.top,
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

    const brushLayer = svg.append('g').attr('class', 'selection-brush-layer')

    svg.append('defs')
      .append('clipPath')
      .attr('id', 'adjmatrix-clip')
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', innerWidth)
      .attr('height', innerHeight)

    const zoomContainer = svg.append('g')
      .attr('class', 'zoom-container')
      .attr('clip-path', 'url(#adjmatrix-clip)')

    zoomContainerRef.current = zoomContainer.node()

    const contentGroup = zoomContainer.append('g')
      .attr('class', 'content')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xMin = d3.min(data.node_gridlines, d => d.row_x_start)
    const xMax = d3.max(data.node_gridlines, d => d.row_x_end)
    const yMin = d3.min(data.node_gridlines, d => d.col_y_start)
    const yMax = d3.max(data.node_gridlines, d => d.col_y_end)

    const xScale = d3.scaleLinear().domain([xMin, xMax]).range([0, innerWidth])
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0])

    const gridGroup = contentGroup.append('g').attr('class', 'matrix-grid')

    gridGroup.selectAll('.matrix-gridline-row')
      .data(data.node_gridlines)
      .join('line')
      .attr('class', 'matrix-gridline matrix-gridline-row')
      .attr('data-node-idx', d => d.node_idx)
      .attr('x1', d => xScale(d.row_x_start))
      .attr('x2', d => xScale(d.row_x_end))
      .attr('y1', d => yScale(d.seriated_position))
      .attr('y2', d => yScale(d.seriated_position))

    gridGroup.selectAll('.matrix-gridline-col')
      .data(data.node_gridlines)
      .join('line')
      .attr('class', 'matrix-gridline matrix-gridline-col')
      .attr('data-node-idx', d => d.node_idx)
      .attr('x1', d => xScale(d.seriated_position))
      .attr('x2', d => xScale(d.seriated_position))
      .attr('y1', d => yScale(d.col_y_start))
      .attr('y2', d => yScale(d.col_y_end))

    const gridHitGroup = contentGroup.append('g').attr('class', 'matrix-grid-hits')

    gridHitGroup.selectAll('.matrix-gridline-hit-row')
      .data(data.node_gridlines)
      .join('line')
      .attr('class', 'matrix-gridline-hit matrix-gridline-hit-row')
      .attr('data-node-idx', d => d.node_idx)
      .attr('x1', d => xScale(d.row_x_start))
      .attr('x2', d => xScale(d.row_x_end))
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
      .attr('y1', d => yScale(d.col_y_start))
      .attr('y2', d => yScale(d.col_y_end))
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
      .attr('r', 1.6)
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

    const isPointInRect = (x, y, x0, y0, x1, y1) => (
      x >= x0 && x <= x1 && y >= y0 && y <= y1
    )

    const collectBrushSelection = (selection) => {
      if (!selection) return { nodeIdxs: [], edgeIdxs: [] }
      const [[x0Raw, y0Raw], [x1Raw, y1Raw]] = selection
      const x0 = Math.min(x0Raw, x1Raw)
      const x1 = Math.max(x0Raw, x1Raw)
      const y0 = Math.min(y0Raw, y1Raw)
      const y1 = Math.max(y0Raw, y1Raw)
      const zoomTransform = d3.zoomTransform(svg.node())

      const selectedNodeIdxs = []
      data.node_gridlines.forEach((node) => {
        const localX = margin.left + xScale(node.seriated_position)
        const localY = margin.top + yScale(node.seriated_position)
        const screenX = zoomTransform.applyX(localX)
        const screenY = zoomTransform.applyY(localY)
        if (isPointInRect(screenX, screenY, x0, y0, x1, y1)) {
          selectedNodeIdxs.push(node.node_idx)
        }
      })

      const selectedEdgeIdxs = []
      data.edges.forEach((edge) => {
        const localX = margin.left + xScale(edge.x)
        const localY = margin.top + yScale(edge.y)
        const screenX = zoomTransform.applyX(localX)
        const screenY = zoomTransform.applyY(localY)
        if (isPointInRect(screenX, screenY, x0, y0, x1, y1)) {
          selectedEdgeIdxs.push(edge.edge_idx)
        }
      })

      return {
        nodeIdxs: selectedNodeIdxs,
        edgeIdxs: selectedEdgeIdxs
      }
    }

    const brushBehavior = d3.brush()
      .extent([[0, 0], [width, height]])
      .filter((event) => {
        if (event.type === 'mousedown') {
          return event.button === 0 && !event.shiftKey
        }
        return !event.shiftKey
      })
      .on('start', (event) => {
        if (event.sourceEvent) event.sourceEvent.stopPropagation()
      })
      .on('brush', (event) => {
        // Selection commits on end to avoid adding intermediate drag extents.
      })
      .on('end', (event) => {
        if (!event.sourceEvent) return
        const { nodeIdxs, edgeIdxs } = collectBrushSelection(event.selection)
        if (nodeIdxs.length > 0) selectNodes(nodeIdxs)
        if (edgeIdxs.length > 0) selectEdges(edgeIdxs)
        brushLayer.call(brushBehavior.move, null)
      })

    brushLayer.call(brushBehavior)
    setRenderVersion(v => v + 1)
  }, [data, hoverNode, hoverNodes, hoverEdge, clearHover, toggleNodeSelection, toggleEdgeSelection, selectNodes, selectEdges])

  // Initial render + auto-center
  useEffect(() => {
    initializeVisualization()
    const centerTimeout = setTimeout(() => handleFitContent(), 100)
    return () => clearTimeout(centerTimeout)
  }, [data, initializeVisualization, handleFitContent])

  // Update visuals (gridlines + cells) on hover/selection + size
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const cellSizes = CELL_SIZES[nodeSize]
    const gridSizes = GRID_SIZES[edgeSize]

    // Cells (edges)
    svg.selectAll('.matrix-cell')
      .attr('fill', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx)) return 'var(--color-edge-selected)'
        if (hoveredEdges.has(edgeIdx)) return 'var(--color-edge-hover)'
        return 'var(--color-text-muted)'
      })
      .attr('opacity', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx) || hoveredEdges.has(edgeIdx)) return 1
        return 0.6
      })
      .attr('r', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx) || hoveredEdges.has(edgeIdx)) return cellSizes.highlighted
        return cellSizes.default
      })
      .each(function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx) || hoveredEdges.has(edgeIdx)) d3.select(this).raise()
      })

    // Gridlines (nodes)
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

  }, [hoveredNodes, hoveredEdges, selectedNodes, selectedEdges, nodeSize, edgeSize, renderVersion])

  return (
    <Pane
      title="Adjacency Matrix"
      accentColor={ACCENT_COLOR}
      isEmpty={!data}
      zoomControls={{
        onZoomIn: zoomIn,
        onZoomOut: zoomOut,
        onReset: resetZoom,
        onFitContent: handleFitContent,
        zoomPercent
      }}
      sizeControls={{
        nodeSize,
        edgeSize,
        onNodeSizeChange: setNodeSize,
        onEdgeSizeChange: setEdgeSize
      }}
    >
      <div
        ref={containerRef}
        className="pane-visualization"
        tabIndex={0}
        role="img"
      />
    </Pane>
  )
}

export default AdjacencyMatrixPane
