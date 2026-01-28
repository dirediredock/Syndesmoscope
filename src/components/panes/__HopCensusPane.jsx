import { useRef, useEffect, useCallback } from 'react'
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

function HopCensusPane({ data, networkName }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const zoomContainerRef = useRef(null)
  const boundsRef = useRef(null)

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
  } = useZoomPan(svgRef, { scaleExtent: [0.5, 4] })

  // Apply zoom transform to the zoom container
  useEffect(() => {
    if (zoomContainerRef.current) {
      d3.select(zoomContainerRef.current).attr('transform', transform)
    }
  }, [transform])

  // Reset zoom when data changes
  useEffect(() => {
    resetZoom()
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
    if (!containerRef.current || !data) return

    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()
    if (width === 0 || height === 0) return

    // Clear previous
    d3.select(container).selectAll('*').remove()

    // Margins for axes
    const margin = { top: 20, right: 20, bottom: 40, left: 50 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

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
    const maxHop = d3.max(data.vectors, v => v.values.length) - 1
    const xScale = d3.scaleLinear()
      .domain([0, maxHop])
      .range([0, innerWidth])

    // Y: count values
    const maxCount = d3.max(data.vectors, v => d3.max(v.values))
    const yScale = d3.scaleLinear()
      .domain([0, maxCount])
      .range([innerHeight, 0])

    // Create line generator
    const line = d3.line()
      .x((d, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX)

    // Draw axes (outside zoom container - fixed position)
    const axesGroup = svg.append('g')
      .attr('class', 'axes')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(maxHop, 10))
      .tickFormat(d => d)

    const yAxis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(d3.format('.0f'))

    axesGroup.append('g')
      .attr('class', 'axis axis-x')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)

    axesGroup.append('g')
      .attr('class', 'axis axis-y')
      .call(yAxis)

    // Axis labels
    axesGroup.append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 35)
      .attr('text-anchor', 'middle')
      .text('Hop distance')

    axesGroup.append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .text('Count')

    // Create zoom container (clipped to content area)
    const zoomContainer = svg.append('g')
      .attr('class', 'zoom-container')
      .attr('clip-path', 'url(#hopcensus-clip)')

    zoomContainerRef.current = zoomContainer.node()

    // Content group inside zoom container
    const contentGroup = zoomContainer.append('g')
      .attr('class', 'content')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Draw polylines group
    const linesGroup = contentGroup.append('g').attr('class', 'census-lines')

    // Draw each census vector as a polyline
    linesGroup.selectAll('.census-line')
      .data(data.vectors)
      .join('path')
      .attr('class', 'census-line')
      .attr('data-node-idx', d => d.node_idx)
      .attr('d', d => line(d.values))
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-text-muted)')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.3)
  }, [data])

  useEffect(() => {
    initializeVisualization()
  }, [data])

  // Update highlighting
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)

    svg.selectAll('.census-line')
      .attr('stroke', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx)) return 'var(--color-node-selected)'
        if (hoveredNodes.has(nodeIdx)) return 'var(--color-node-hover)'
        return 'var(--color-text-muted)'
      })
      .attr('stroke-width', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return 2
        return 1
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

  }, [hoveredNodes, selectedNodes])

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
    >
      <div
        ref={containerRef}
        className="pane-visualization"
        tabIndex={0}
        role="img"
        aria-label="Hop-Census visualization. Use +/- to zoom, drag to pan."
      />
    </Pane>
  )
}

export default HopCensusPane
