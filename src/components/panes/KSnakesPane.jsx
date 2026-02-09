import { useRef, useEffect, useCallback, useState } from 'react'
import * as d3 from 'd3'
import Pane from '../ui/Pane'
import { useSelection } from '../../contexts/SelectionContext'
import { useZoomPan } from '../../hooks/useZoomPan'
import './KSnakesPane.css'

/**
 * KSnakesPane - k-Snakes invariant plot visualization
 *
 * Visualizes k-core decomposition with onion layer structure.
 * Data structure: cores[] > islands[] > nodes[]
 *
 * Visual layers (z-order):
 * - Core lines: sky blue, 18px width (z-0)
 * - Island lines: violet, 10px width (z-1)
 * - Node circles: filled circles matching NodeLink style (z-2)
 * - Core labels: "k-{n}" at leftmost position
 */

const ACCENT_COLOR = 'var(--color-accent-ksnakes)'

const NODE_SIZES = {
  S: { default: 0.2, highlighted: 1 },
  M: { default: 2, highlighted: 5 },
  L: { default: 12, highlighted: 15 }
}

const STRUCTURE_SIZES = {
  S: { core: 7, island: 3, coreSingleton: 2.5, islandSingleton: 1 },
  M: { core: 18, island: 10, coreSingleton: 9, islandSingleton: 5 },
  L: { core: 36, island: 20, coreSingleton: 18, islandSingleton: 10 }
}

function KSnakesPane({ data, networkName }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const zoomContainerRef = useRef(null)
  const boundsRef = useRef(null)

  const [nodeSize, setNodeSize] = useState('M')
  const [edgeSize, setEdgeSize] = useState('M')

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
    setEdgeSize('M')
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
    if (!containerRef.current || !data || !data.cores) return

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

    // Flatten all nodes for scale calculation
    const allNodes = []
    data.cores.forEach(core => {
      core.islands.forEach(island => {
        island.nodes.forEach(node => {
          allNodes.push({
            ...node,
            core_value: core.core_value,
            island_idx: island.island_idx
          })
        })
      })
    })

    if (allNodes.length === 0) return

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
      .attr('id', 'ksnakes-clip')
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', innerWidth)
      .attr('height', innerHeight)

    // Calculate scales
    const xExtent = d3.extent(allNodes, d => d.x_position)
    const yExtent = d3.extent(allNodes, d => d.onion_value)

    // Add padding to extents
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1 || 1
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1 || 1

    // X scale: INVERTED per Python spec (right-to-left)
    const xScale = d3.scaleLinear()
      .domain([xExtent[1] + xPadding, xExtent[0] - xPadding])
      .range([0, innerWidth])

    // Y scale: normal orientation
    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([innerHeight, 0])

    // Line generator
    const lineGenerator = d3.line()
      .x(d => xScale(d.x_position))
      .y(d => yScale(d.onion_value))

    // Create zoom container (clipped to content area)
    const zoomContainer = svg.append('g')
      .attr('class', 'zoom-container')
      .attr('clip-path', 'url(#ksnakes-clip)')

    zoomContainerRef.current = zoomContainer.node()

    // Content group inside zoom container
    const contentGroup = zoomContainer.append('g')
      .attr('class', 'content')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // z-order 0: Core-level lines (skyblue, 18px)
    const coreGroup = contentGroup.append('g').attr('class', 'core-lines')

    data.cores.forEach(core => {
      // Collect all nodes in this core
      const coreNodes = []
      core.islands.forEach(island => {
        island.nodes.forEach(node => {
          coreNodes.push(node)
        })
      })

      if (coreNodes.length === 0) return

      // Singleton node: draw a background circle instead of a line
      if (coreNodes.length === 1) {
        const node = coreNodes[0]
        coreGroup.append('circle')
          .attr('class', 'core-singleton')
          .attr('cx', xScale(node.x_position))
          .attr('cy', yScale(node.onion_value))
          .attr('r', 9)
          .attr('fill', 'var(--color-ksnakes-core)')
        return
      }

      // Sort by x_position
      const sortedNodes = [...coreNodes].sort((a, b) => a.x_position - b.x_position)

      coreGroup.append('path')
        .datum(sortedNodes)
        .attr('class', 'core-line')
        .attr('d', lineGenerator)
        .attr('fill', 'none')
        .attr('stroke', 'var(--color-ksnakes-core)')
        .attr('stroke-width', 18)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
    })

    // z-order 1: Island-level lines (lavender, 10px)
    const islandGroup = contentGroup.append('g').attr('class', 'island-lines')

    data.cores.forEach(core => {
      core.islands.forEach(island => {
        if (island.nodes.length === 0) return

        // Singleton node: draw a background circle instead of a line
        if (island.nodes.length === 1) {
          const node = island.nodes[0]
          islandGroup.append('circle')
            .attr('class', 'island-singleton')
            .attr('cx', xScale(node.x_position))
            .attr('cy', yScale(node.onion_value))
            .attr('r', 5)
            .attr('fill', 'var(--color-ksnakes-island)')
          return
        }

        // Sort by x_position
        const sortedNodes = [...island.nodes].sort((a, b) => a.x_position - b.x_position)

        islandGroup.append('path')
          .datum(sortedNodes)
          .attr('class', 'island-line')
          .attr('d', lineGenerator)
          .attr('fill', 'none')
          .attr('stroke', 'var(--color-ksnakes-island)')
          .attr('stroke-width', 10)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round')
      })
    })

    // Node circles (single filled circles like NodeLink)
    const nodesGroup = contentGroup.append('g').attr('class', 'snake-nodes')

    // Single circles matching NodeLink style
    nodesGroup.selectAll('.snake-node')
      .data(allNodes)
      .join('circle')
      .attr('class', 'snake-node')
      .attr('data-node-idx', d => d.node_idx)
      .attr('cx', d => xScale(d.x_position))
      .attr('cy', d => yScale(d.onion_value))
      .attr('r', 3)
      .attr('fill', 'var(--color-text-secondary)')

    // Core labels: "k-{n}" at leftmost position
    const labelsGroup = contentGroup.append('g').attr('class', 'core-labels')

    data.cores.forEach(core => {
      // Find node with minimum x_position and corresponding minimum onion_value
      let minNode = null
      core.islands.forEach(island => {
        island.nodes.forEach(node => {
          if (!minNode || node.x_position < minNode.x_position) {
            minNode = node
          } else if (node.x_position === minNode.x_position && node.onion_value < minNode.onion_value) {
            minNode = node
          }
        })
      })

      if (minNode) {
        labelsGroup.append('text')
          .attr('class', 'core-label')
          .attr('x', xScale(minNode.x_position) + 15)
          .attr('y', yScale(minNode.onion_value))
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle')
          .attr('fill', 'var(--color-ksnakes-core)')
          .attr('font-family', 'Arial, sans-serif')
          .attr('font-weight', 'bold')
          .attr('font-size', '12px')
          .text(`k-${core.core_value}`)
      }
    })
  }, [])

  useEffect(() => {
    initializeVisualization()
  }, [data, initializeVisualization])

  // Update structure sizes when edgeSize changes
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const structureSizes = STRUCTURE_SIZES[edgeSize]

    // Update core lines and singletons
    svg.selectAll('.core-line').attr('stroke-width', structureSizes.core)
    svg.selectAll('.core-singleton').attr('r', structureSizes.coreSingleton)

    // Update island lines and singletons
    svg.selectAll('.island-line').attr('stroke-width', structureSizes.island)
    svg.selectAll('.island-singleton').attr('r', structureSizes.islandSingleton)

  }, [edgeSize])

  // Update highlighting (matching NodeLink style)
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const nodeSizes = NODE_SIZES[nodeSize]

    // Update node styles (same pattern as NodeLink)
    svg.selectAll('.snake-node')
      .attr('fill', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx)) return 'var(--color-node-selected)'
        if (hoveredNodes.has(nodeIdx)) return 'var(--color-node-hover)'
        return 'var(--color-text-secondary)'
      })
      .attr('r', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return nodeSizes.highlighted
        return nodeSizes.default
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

export default KSnakesPane
