import { useRef, useEffect, useCallback, useState } from 'react'
import * as d3 from 'd3'
import Pane from '../ui/Pane'
import { useSelection } from '../../contexts/SelectionContext'
import { useZoomPan } from '../../hooks/useZoomPan'
import './HopCensusPane.css'

/**
 * HopCensusPane - Hop-Census invariant plot visualization
 *
 * From the paper: "The Hop-Census plot encodes the Census data structure,
 * which is composed of one vector of integers per node. Each vector is
 * visually encoded as a polyline in a shared coordinate system."
 *
 * - X-axis: hop distance (bounded by diameter)
 * - Y-axis: count of constituents at each hop
 * - Each polyline represents one node's census vector
 *
 * This creates an "absolute coordinate system" that makes comparison
 * across graphs possible (a key advantage of invariant plots).
 */

const ACCENT_COLOR = 'var(--color-accent-hopcensus)'

const LINE_SIZES = {
  S: { default: 0.1, highlighted: 0.3 },
  M: { default: 1, highlighted: 2 },
  L: { default: 5, highlighted: 7 }
}

function HopCensusPane({ data, networkName }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const zoomContainerRef = useRef(null)
  const boundsRef = useRef(null)

  const [nodeSize, setNodeSize] = useState('M')

  const {
    hoveredNodes,
    selectedNodes,
    hoverNode,
    clearHover,
    toggleNodeSelection
  } = useSelection()

  const {
    transform,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContent,
    zoomPercent
  } = useZoomPan(svgRef, { scaleExtent: [0.5, 9.99] })

  // Apply zoom transform to the zoom container
  useEffect(() => {
    if (zoomContainerRef.current) {
      d3.select(zoomContainerRef.current).attr('transform', transform)
    }
  }, [transform])

  // Reset zoom and sizes when data changes
  useEffect(() => {
    resetZoom()
    setNodeSize('M')
  }, [data, resetZoom])

  // Calculate bounds for fit-to-content
  const handleFitContent = useCallback(() => {
    if (boundsRef.current) {
      fitToContent(boundsRef.current)
    }
  }, [fitToContent])

  // Keyboard shortcuts
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
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [data])

  // Initialize visualization
  const initializeVisualization = useCallback(() => {
    if (!containerRef.current || !data || !data.census_vectors) return

    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()
    if (width === 0 || height === 0) return

    // Clear previous
    d3.select(container).selectAll('*').remove()

    // Use square aspect ratio (minimum dimension)
    const size = Math.min(width, height)

    // 5% margins per Python spec
    const margin = {
      top: size * 0.05,
      right: size * 0.05,
      bottom: size * 0.05,
      left: size * 0.05
    }
    const innerWidth = size - margin.left - margin.right
    const innerHeight = size - margin.top - margin.bottom

    // Store bounds for fit-to-content
    boundsRef.current = {
      x: margin.left,
      y: margin.top,
      width: innerWidth,
      height: innerHeight
    }

    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('width', '100%')
      .style('height', '100%')

    svgRef.current = svg.node()

    // Create clip path for content area
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'hopcensus-clip')
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', innerWidth)
      .attr('height', innerHeight)

    // Calculate scales
    // X: hop distance (0 to max hop)
    const maxHop = d3.max(data.census_vectors, v => v.vector.length) - 1
    const xScale = d3.scaleLinear()
      .domain([0, maxHop])
      .range([0, innerWidth])

    // Y: count values
    const maxCount = d3.max(data.census_vectors, v => d3.max(v.vector))
    const yScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([innerHeight, 0])

    // Create line generator
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))

    // Create zoom container (clipped to content area)
    const zoomContainer = svg.append('g')
      .attr('class', 'zoom-container')
      .attr('clip-path', 'url(#hopcensus-clip)')

    zoomContainerRef.current = zoomContainer.node()

    // Content group inside zoom container
    const contentGroup = zoomContainer.append('g')
      .attr('class', 'content')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Draw vertical gridlines at each hop position (z-order -1, behind lines)
    const gridGroup = contentGroup.append('g').attr('class', 'grid-lines')
    for (let i = 0; i <= maxHop; i++) {
      gridGroup.append('line')
        .attr('class', 'grid-line')
        .attr('x1', xScale(i))
        .attr('y1', 0)
        .attr('x2', xScale(i))
        .attr('y2', innerHeight)
        .attr('stroke', '#081c25')
        .attr('stroke-width', 4)
        .attr('stroke-opacity', 0.6)
    }

    // Draw polylines group (z-order 1)
    const linesGroup = contentGroup.append('g').attr('class', 'census-lines')

    // Draw each census vector as a polyline
    linesGroup.selectAll('.census-line')
      .data(data.census_vectors)
      .join('path')
      .attr('class', 'census-line')
      .attr('data-node-idx', d => d.node_idx)
      .attr('d', d => line(d.vector))
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-text-muted)')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.3)
      .attr('stroke-linecap', 'round')
  }, [data])

  useEffect(() => {
    initializeVisualization()
  }, [data])

  // Update highlighting based on selection state and size settings
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const lineSizes = LINE_SIZES[nodeSize]

    svg.selectAll('.census-line')
      .attr('stroke', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx)) return 'var(--color-node-selected)'
        if (hoveredNodes.has(nodeIdx)) return 'var(--color-node-hover)'
        return 'var(--color-text-muted)'
      })
      .attr('stroke-width', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return lineSizes.highlighted
        return lineSizes.default
      })
      .attr('stroke-opacity', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return 1
        return 0.3
      })
      .each(function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) {
          d3.select(this).raise()
        }
      })

  }, [hoveredNodes, selectedNodes, nodeSize])

  // Set up event handlers
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)

    svg.selectAll('.census-line')
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

  }, [data, hoverNode, clearHover, toggleNodeSelection])

  return (
    <Pane
      title="Hop-Census"
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
        edgeSize: null,
        onNodeSizeChange: setNodeSize,
        onEdgeSizeChange: null
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

export default HopCensusPane
