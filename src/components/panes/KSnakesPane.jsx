import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import Pane from '../ui/Pane'
import { useSelection } from '../../contexts/SelectionContext'
import { useZoomPan } from '../../hooks/useZoomPan'
import './KSnakesPane.css'

/**
 * KSnakesPane - k-Snakes invariant plot visualization
 *
 * NOTE: This is a placeholder implementation. The exact visualization
 * depends on the data structure from Matt's precomputation.
 *
 * From the specs doc, k-Snakes appears to be related to k-core
 * decomposition, showing how nodes relate to different core levels.
 *
 * TODO: Confirm data structure and implement visualization
 */

const ACCENT_COLOR = 'var(--color-accent-ksnakes)'

function KSnakesPane({ data, networkName }) {
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

  // Initialize visualization
  useEffect(() => {
    if (!containerRef.current || !data) return

    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()
    if (width === 0 || height === 0) return

    // Clear previous
    d3.select(container).selectAll('*').remove()

    // Base margins
    const baseMargin = { top: 20, right: 20, bottom: 40, left: 50 }

    // Calculate square dimensions for inner plot
    const availableWidth = width - baseMargin.left - baseMargin.right
    const availableHeight = height - baseMargin.top - baseMargin.bottom
    const plotSize = Math.min(availableWidth, availableHeight)
    
    const innerWidth = plotSize
    const innerHeight = plotSize

    // Center the plot by adjusting margins
    const extraHorizontal = availableWidth - plotSize
    const extraVertical = availableHeight - plotSize
    
    const margin = {
      top: baseMargin.top + extraVertical / 2,
      right: baseMargin.right + extraHorizontal / 2,
      bottom: baseMargin.bottom + extraVertical / 2,
      left: baseMargin.left + extraHorizontal / 2
    }

    // Calculate node radius based on plot size
    const baseRadius = plotSize / 200 // Scale with plot size
    const hoverRadius = baseRadius * 1.5

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

    svgRef.current = svg.node()

    // Create clip path for content area
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'ksnakes-clip')
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', innerWidth)
      .attr('height', innerHeight)

    if (data.nodes && data.nodes.length > 0) {
      // // X: node index or position
      // const xScale = d3.scaleLinear()
      //   .domain([0, data.nodes.length - 1])
      //   .range([0, innerWidth])

      // // Y: k-core value
      // const maxK = d3.max(data.nodes, d => d.degree || d.k || 1)
      // const yScale = d3.scaleLinear()
      //   .domain([0, maxK])
      //   .range([innerHeight, 0])

      // Sort nodes by k-core for snake visualization
      const sortedNodes = [...data.nodes].sort((a, b) =>
        (a.degree || a.k || 0) - (b.degree || b.k || 0)
      )

      // X dimension padding
      const nodePadding = 20
      const xScale = d3.scaleLinear()
        .domain([0, data.nodes.length - 1])
        .range([nodePadding, innerWidth - nodePadding])

      // Y dimension padding
      const maxK = d3.max(data.nodes, d => d.degree || d.k || 1)
      const yScale = d3.scaleLinear()
        .domain([0, maxK])
        .range([innerHeight - nodePadding, nodePadding])

      // // Create line generator
      // const line = d3.line()
      //   .x((d, i) => xScale(i))
      //   .y(d => yScale(d.degree || d.k || 0))
      //   .curve(d3.curveMonotoneX)

      // // Draw axes (outside zoom container - fixed position)
      // const axesGroup = svg.append('g')
      //   .attr('class', 'axes')
      //   .attr('transform', `translate(${margin.left},${margin.top})`)

      // axesGroup.append('g')
      //   .attr('class', 'axis axis-x')
      //   .attr('transform', `translate(0,${innerHeight})`)
      //   .call(d3.axisBottom(xScale).ticks(5))

      // axesGroup.append('g')
      //   .attr('class', 'axis axis-y')
      //   .call(d3.axisLeft(yScale).ticks(maxK))

      // // Axis labels
      // axesGroup.append('text')
      //   .attr('class', 'axis-label')
      //   .attr('x', innerWidth / 2)
      //   .attr('y', innerHeight + 35)
      //   .attr('text-anchor', 'middle')
      //   .text('Node (sorted by k-core)')

      // axesGroup.append('text')
      //   .attr('class', 'axis-label')
      //   .attr('transform', 'rotate(-90)')
      //   .attr('x', -innerHeight / 2)
      //   .attr('y', -40)
      //   .attr('text-anchor', 'middle')
      //   .text('k-core')

      // Create zoom container (clipped to content area)
      const zoomContainer = svg.append('g')
        .attr('class', 'zoom-container')
        .attr('clip-path', 'url(#ksnakes-clip)')

      zoomContainerRef.current = zoomContainer.node()

      // Content group inside zoom container
      const contentGroup = zoomContainer.append('g')
        .attr('class', 'content')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // // Draw the snake line
      // contentGroup.append('path')
      //   .datum(sortedNodes)
      //   .attr('class', 'snake-line')
      //   .attr('d', line)
      //   .attr('fill', 'none')
      //   .attr('stroke', 'var(--color-accent-ksnakes)')
      //   .attr('stroke-width', 2)
      //   .attr('stroke-opacity', 0.6)

      // Draw node points
      const nodesGroup = contentGroup.append('g').attr('class', 'snake-nodes')

      // Add red border around nodes group
      const nodesBBox = { x: 0, y: 0, width: innerWidth, height: innerHeight }
      nodesGroup.append('rect')
        .attr('x', nodesBBox.x)
        .attr('y', nodesBBox.y)
        .attr('width', nodesBBox.width)
        .attr('height', nodesBBox.height)
        .attr('fill', 'none')
        .attr('stroke', 'tomato')
        .attr('stroke-width', 0.5)
        .attr('pointer-events', 'none')

      nodesGroup.selectAll('.snake-node')
        .data(sortedNodes)
        .join('circle')
        .attr('class', 'snake-node')
        .attr('data-node-idx', d => d.node_idx)
        .attr('cx', (d, i) => xScale(i))
        .attr('cy', d => yScale(d.degree || d.k || 0))
        .attr('r', baseRadius)
        .attr('fill', 'var(--color-text-secondary)')
    }

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      // Re-render on resize
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [data])

  // Update highlighting
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)

    // Get the base radius from the first node
    const firstNode = svg.select('.snake-node')
    const baseRadius = firstNode.empty() ? 4 : +firstNode.attr('r')
    const hoverRadius = baseRadius * 1.5

    svg.selectAll('.snake-node')
      .attr('fill', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx)) return 'var(--color-node-selected)'
        if (hoveredNodes.has(nodeIdx)) return 'var(--color-node-hover)'
        return 'var(--color-text-secondary)'
      })
      .attr('r', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return hoverRadius
        return baseRadius
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

    svg.selectAll('.snake-node')
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
      title="k-Snakes"
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
        aria-label="k-Snakes visualization. Use +/- to zoom, drag to pan."
      />
    </Pane>
  )
}

export default KSnakesPane
