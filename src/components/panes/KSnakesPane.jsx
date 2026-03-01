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

// Edge overlay sizes (same values as NodeLink EDGE_SIZES)
const EDGE_OVERLAY_SIZES = {
  XS: { default: 0.25, highlighted: 0.5 },
  S:  { default: 0.5,  highlighted: 1   },
  M:  { default: 1,    highlighted: 2   },
  L:  { default: 2,    highlighted: 3.5 },
  XL: { default: 4,    highlighted: 6   }
}

const OVERLAY_CYCLE = ['off', 'XS', 'S', 'M', 'L', 'XL']

// Radius steps by ~1.7× per level so visual area (πr²) steps by ~3× per level
const NODE_SIZES = {
  XS: { default: 0.1,  highlighted: 0.1 },
  S:  { default: 1.2,  highlighted: 2.5 },
  M:  { default: 2,    highlighted: 5   },
  L:  { default: 3.5,  highlighted: 7   },
  XL: { default: 6,    highlighted: 11  }
}

// Widths perceived linearly, ~1.7× geometric steps
const STRUCTURE_SIZES = {
  XS: { core: 6,  island: 3.5, coreSingleton: 3,  islandSingleton: 1.5 },
  S:  { core: 10, island: 6,   coreSingleton: 5,  islandSingleton: 3   },
  M:  { core: 18, island: 10,  coreSingleton: 9,  islandSingleton: 5   },
  L:  { core: 30, island: 17,  coreSingleton: 15, islandSingleton: 8.5 },
  XL: { core: 52, island: 29,  coreSingleton: 25, islandSingleton: 14  }
}

function KSnakesPane({ data, nodeLinkData, networkName }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const zoomContainerRef = useRef(null)
  const boundsRef = useRef(null)
  const brushGroupRef = useRef(null)

  const [nodeSize, setNodeSize] = useState('M')
  const [edgeSize, setEdgeSize] = useState('M')
  const [edgeOverlay, setEdgeOverlay] = useState('off')
  const [brushMode, setBrushMode] = useState(false)

  const {
    hoveredNodes,
    hoveredEdges,
    selectedNodes,
    selectedEdges,
    hoverNode,
    clearHover,
    toggleNodeSelection,
    selectNodes
  } = useSelection()

  const {
    transform,
    resetZoom,
    setFilter,
    zoomPercent
  } = useZoomPan(svgRef, { scaleExtent: [0.5, 15] })

  useEffect(() => {
    if (!setFilter) return
    setFilter((event) => {
      if (event.type === 'wheel') return true
      if (brushMode) return false
      if (event.target && event.target.classList && event.target.classList.contains('snake-node')) return false
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

  // Apply zoom transform to the zoom container
  useEffect(() => {
    if (zoomContainerRef.current) {
      d3.select(zoomContainerRef.current).attr('transform', transform)
    }
  }, [transform])

  // Reset zoom centered on content bounds
  const handleResetZoom = useCallback(() => {
    resetZoom(boundsRef.current)
  }, [resetZoom])

  // Reset zoom and sizes when data changes
  useEffect(() => {
    handleResetZoom()
    setNodeSize('M')
    setEdgeSize('M')
    setEdgeOverlay('off')
  }, [data, handleResetZoom])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const resizeObserver = new ResizeObserver(() => {
      d3.select(container).selectAll('*').remove()

      if (containerRef.current && data) {
        initializeVisualization()
        // Auto-center after resize
        setTimeout(() => handleResetZoom(), 100)
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [data, handleResetZoom])

  // Initialize visualization
  const initializeVisualization = useCallback(() => {
    if (!containerRef.current || !data || !data.cores) return

    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()
    if (width === 0 || height === 0) return

    // Clear previous
    d3.select(container).selectAll('*').remove()

    // Use 1:2 aspect ratio (horizontal:vertical)
    const contentWidth = Math.min(width, height / 2)
    const contentHeight = 2 * contentWidth

    // 5% margins
    const margin = {
      top: contentHeight * 0.01,
      right: contentWidth * 0.01,
      bottom: contentHeight * 0.01,
      left: contentWidth * 0.01
    }
    const innerWidth = contentWidth - margin.left - margin.right
    const innerHeight = contentHeight - margin.top - margin.bottom

    // Center content in viewport
    const preOffsetX = (width - contentWidth) / 2
    const preOffsetY = (height - contentHeight) / 2

    // Store bounds for fit-to-content, accounting for centering offset
    boundsRef.current = {
      x: preOffsetX + margin.left,
      y: preOffsetY + margin.top,
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

    ///////////////////////////////////////////////////////////////////////////

    // Debug: red border around content area
    // svg.append('rect')
    //   .attr('x', preOffsetX + margin.left)
    //   .attr('y', preOffsetY + margin.top)
    //   .attr('width', innerWidth)
    //   .attr('height', innerHeight)
    //   .attr('fill', 'none')
    //   .attr('stroke', 'red')
    //   .attr('stroke-width', 0.5)

    ///////////////////////////////////////////////////////////////////////////

    // (clip path removed)
    svg.append('defs')
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

    // Create zoom container
    const zoomContainer = svg.append('g')
      .attr('class', 'zoom-container')

    zoomContainerRef.current = zoomContainer.node()

    // Content group inside zoom container
    const contentGroup = zoomContainer.append('g')
      .attr('class', 'content')
      .attr('transform', `translate(${preOffsetX + margin.left},${preOffsetY + margin.top})`)

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

    // z-order 2: Edge overlay lines (from NodeLink data, view-only)
    if (nodeLinkData && nodeLinkData.edges) {
      const nodePositions = new Map()
      allNodes.forEach(n => {
        nodePositions.set(n.node_idx, { x: xScale(n.x_position), y: yScale(n.onion_value) })
      })

      const edgeOverlayGroup = contentGroup.append('g')
        .attr('class', 'edge-overlay')
        .style('pointer-events', 'none')

      nodeLinkData.edges.forEach(edge => {
        const src = nodePositions.get(edge.source)
        const tgt = nodePositions.get(edge.target)
        if (!src || !tgt) return

        edgeOverlayGroup.append('line')
          .attr('class', 'overlay-edge')
          .attr('data-edge-idx', edge.edge_idx)
          .attr('x1', src.x)
          .attr('y1', src.y)
          .attr('x2', tgt.x)
          .attr('y2', tgt.y)
          .attr('stroke', 'var(--color-edge-selected)')
          .attr('stroke-width', 1)
          .style('display', 'none')
      })
    }

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
      .on('mouseenter', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        hoverNode(nodeIdx)
      })
      .on('mouseleave', function () {
        clearHover()
      })
      .on('click', function (event) {
        event.stopPropagation()
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        toggleNodeSelection(nodeIdx)
      })

    // Core labels: "k-{n}" at leftmost position
    const labelsGroup = contentGroup.append('g').attr('class', 'core-labels')

    const coreValues = data.cores.map(c => c.core_value)
    const minCoreValue = Math.min(...coreValues)
    const maxCoreValue = Math.max(...coreValues)

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
        const label = labelsGroup.append('text')
          .attr('class', 'core-label')
          .attr('x', xScale(minNode.x_position) + 25)
          .attr('y', yScale(minNode.onion_value))
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle')
          .attr('fill', 'var(--color-ksnakes-core)')
          .attr('font-family', 'Roboto Condensed, sans-serif')
          .attr('font-weight', 'bold')
          .attr('font-size', '17px')

        label.append('tspan').text(`k-${core.core_value}`)

        if (core.core_value === minCoreValue) {
          label.append('tspan')
            .attr('x', xScale(minNode.x_position) + 25)
            .attr('dy', '1.2em')
            .attr('font-size', '15px')
            .text('(periphery)')
        } else if (core.core_value === maxCoreValue) {
          label.append('tspan')
            .attr('x', xScale(minNode.x_position) + 25)
            .attr('dy', '1.2em')
            .attr('font-size', '15px')
            .text('(core)')
        }
      }
    })

    // "Core" label above the uppermost k-snake, "Periphery" below the lowermost
    // const annotationGroup = contentGroup.append('g').attr('class', 'core-periphery-labels')

    // annotationGroup.append('text')
    //   .attr('x', 41)
    //   .attr('y', 12)
    //   .attr('text-anchor', 'start')
    //   .attr('dominant-baseline', 'auto')
    //   .attr('fill', 'var(--color-text-secondary)')
    //   .attr('font-family', 'Roboto Condensed, sans-serif')
    //   .attr('font-weight', 'bold')
    //   .attr('font-size', '14px')
    //   .attr('opacity', 0.7)
    //   .text('Core')

    // annotationGroup.append('text')
    //   .attr('x', 41)
    //   .attr('y', innerHeight-2)
    //   .attr('text-anchor', 'start')
    //   .attr('dominant-baseline', 'auto')
    //   .attr('fill', 'var(--color-text-secondary)')
    //   .attr('font-family', 'Roboto Condensed, sans-serif')
    //   .attr('font-weight', 'bold')
    //   .attr('font-size', '14px')
    //   .attr('opacity', 0.7)
    //   .text('Periphery')

    // Brush overlay (on top of zoom container so it intercepts events)
    const brushGroup = svg.append('g').attr('class', 'ksnakes-brush-group')
    brushGroupRef.current = brushGroup.node()

    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on('end', (event) => {
        if (!event.selection) return
        const [[bx0, by0], [bx1, by1]] = event.selection

        const matched = []
        const svgNode = svg.node()
        svg.selectAll('.snake-node').each(function () {
          const circle = this
          const ctm = circle.getCTM()
          const svgPt = svgNode.createSVGPoint()
          svgPt.x = +circle.getAttribute('cx')
          svgPt.y = +circle.getAttribute('cy')
          const screen = svgPt.matrixTransform(ctm)
          if (screen.x >= bx0 && screen.x <= bx1 && screen.y >= by0 && screen.y <= by1) {
            matched.push(+d3.select(this).attr('data-node-idx'))
          }
        })

        brushGroup.call(brush.move, null)
        if (matched.length > 0) selectNodes(matched)
      })

    brushGroup.call(brush)
    brushGroup.style('pointer-events', 'none')
    brushGroup.select('.overlay').style('pointer-events', 'none').style('cursor', 'default')

  }, [data, hoverNode, clearHover, toggleNodeSelection, selectNodes])

    // Reapply highlighting after DOM build to ensure visuals match selection state
    try {
      const svg = d3.select(svgRef.current)
      const nodeSizes = NODE_SIZES[nodeSize]
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
          if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) d3.select(this).raise()
        })

      Promise.resolve().then(() => {
        try {
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
        } catch (e) {}
      })
    } catch (e) {
      // ignore
    }

  useEffect(() => {
    initializeVisualization()
    // Auto-center after initial render
    const centerTimeout = setTimeout(() => {
      handleResetZoom()
    }, 100)
    return () => clearTimeout(centerTimeout)
  }, [data, handleResetZoom])

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

    // Reapply highlighting after size change to keep visuals synced
    try {
      const nodeSizes = NODE_SIZES[nodeSize]
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
      Promise.resolve().then(() => {
        try { svg.selectAll('.snake-node').each(function () { const nodeIdx = +d3.select(this).attr('data-node-idx'); if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) d3.select(this).raise() }) } catch (e) {}
      })
    } catch (e) {}

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

  // Update edge overlay visibility, sizing, and highlighting
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    const overlayGroup = svg.select('.edge-overlay')
    if (overlayGroup.empty()) return

    if (edgeOverlay === 'off') {
      overlayGroup.style('display', 'none')
      return
    }

    overlayGroup.style('display', null)
    const sizes = EDGE_OVERLAY_SIZES[edgeOverlay]

    svg.selectAll('.overlay-edge')
      .style('display', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        return selectedEdges.has(edgeIdx) ? null : 'none'
      })
      .attr('stroke', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (hoveredEdges.has(edgeIdx)) return 'var(--color-edge-hover)'
        return 'var(--color-edge-selected)'
      })
      .attr('stroke-width', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (hoveredEdges.has(edgeIdx)) return sizes.highlighted
        return sizes.default
      })

  }, [edgeOverlay, hoveredEdges, selectedEdges])


  return (
    <Pane
      title="k-Snakes"
      accentColor={ACCENT_COLOR}
      isEmpty={!data}
      headerControls={
        <>
          <div className="zoom-controls" role="group" aria-label="Brush Selection">
            <button
              className={`zoom-btn${brushMode ? ' zoom-btn--active' : ' zoom-btn--off'}`}
              onClick={() => setBrushMode(b => !b)}
              aria-label="Toggle brush selection"
              title="Brush Select"
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                <rect x="2" y="2" width="10" height="5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <rect x="5.5" y="7" width="3" height="5" rx="0.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          <div className="size-controls" role="group" aria-label="Edge Overlay">
            <button
              className={`size-toggle-btn${edgeOverlay === 'off' ? ' size-toggle-btn--off' : ''}`}
              style={edgeOverlay !== 'off' ? { color: 'var(--color-edge-selected)' } : undefined}
              onClick={() => {
                const idx = OVERLAY_CYCLE.indexOf(edgeOverlay)
                setEdgeOverlay(OVERLAY_CYCLE[(idx + 1) % OVERLAY_CYCLE.length])
              }}
              aria-label="Overlay Edges"
              title={edgeOverlay === 'off' ? 'Show edges' : `Edges: ${edgeOverlay}`}
            >
              <svg className="size-toggle-icon" width="14" height="14" viewBox="0 0 10 10">
                <line x1="2" y1="8" x2="8" y2="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="2" cy="8" r="1.5" fill="currentColor" />
                <circle cx="8" cy="2" r="1.5" fill="currentColor" />
              </svg>
              {edgeOverlay !== 'off' && <span className="size-toggle-label">{edgeOverlay}</span>}
            </button>
          </div>
        </>
      }
      zoomControls={{
        onReset: handleResetZoom,
        zoomPercent
      }}
      sizeControls={{
        nodeSize,
        edgeSize,
        edgeIcon: (
          <svg className="size-toggle-icon" width="14" height="14" viewBox="0 -1 10 10">
            <path d="M-1,6 C0.5,9 1,1 3,5 S4.5,9 6,4 S8,0 9,5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ),
        onNodeSizeChange: setNodeSize,
        onEdgeSizeChange: setEdgeSize
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

export default KSnakesPane
