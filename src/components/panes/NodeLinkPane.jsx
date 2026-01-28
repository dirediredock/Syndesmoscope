import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'
import Pane from '../ui/Pane'
import { useSelection } from '../../contexts/SelectionContext'
import { useZoomPan } from '../../hooks/useZoomPan'
import './NodeLinkPane.css'

/**
 * NodeLinkPane - Force-directed node-link visualization
 *
 * This is a traditional graph visualization where:
 * - Nodes are circles positioned by force simulation
 * - Edges are lines connecting nodes
 *
 * Selection highlighting:
 * - Hovered nodes/edges get muted highlight color
 * - Selected nodes/edges get solid highlight color
 * - Selected elements are raised to front (z-order)
 *
 * Zoom/Pan:
 * - Scroll wheel zooms at cursor position
 * - Drag empty space to pan
 * - Drag nodes to reposition them (filtered from pan)
 */

const ACCENT_COLOR = 'var(--color-accent-nodelink)'

function NodeLinkPane({ data, networkName }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const zoomContainerRef = useRef(null)
  const simulationRef = useRef(null)

  const {
    hoveredNodes,
    hoveredEdges,
    selectedNodes,
    selectedEdges,
    hoverNode,
    hoverEdge,
    clearHover,
    toggleNodeSelection,
    toggleEdgeSelection
  } = useSelection()

  const {
    transform,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContent,
    setFilter,
    zoomPercent
  } = useZoomPan(svgRef, { scaleExtent: [0.1, 4] })

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

  // Calculate bounds for fit-to-content based on node positions
  const handleFitContent = useCallback(() => {
    const simulation = simulationRef.current
    if (!simulation) return

    const nodes = simulation.nodes()
    if (!nodes || nodes.length === 0) return

    const padding = 20
    const xs = nodes.map(n => n.x)
    const ys = nodes.map(n => n.y)

    const bounds = {
      x: d3.min(xs) - padding,
      y: d3.min(ys) - padding,
      width: (d3.max(xs) - d3.min(xs)) + padding * 2,
      height: (d3.max(ys) - d3.min(ys)) + padding * 2
    }

    fitToContent(bounds)
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
    if (!containerRef.current || !svgRef.current || !simulationRef.current) return

    const container = containerRef.current
    const svg = d3.select(svgRef.current)
    const simulation = simulationRef.current

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect()
      if (width > 0 && height > 0) {
        svg.attr('width', width).attr('height', height)
        svg.attr('viewBox', `0 0 ${width} ${height}`)
        
        simulation.force('center', d3.forceCenter(width / 2, height / 2))
        simulation.alpha(0.3).restart()
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Initialize D3 visualization
  useEffect(() => {
    if (!containerRef.current || !data) return

    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()
    if (width === 0 || height === 0) return

    // Clear previous
    d3.select(container).selectAll('*').remove()

    // Create SVG
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('width', '100%')
      .style('height', '100%')

    svgRef.current = svg.node()

    // Create zoom container (all content goes here)
    const zoomContainer = svg.append('g').attr('class', 'zoom-container')
    zoomContainerRef.current = zoomContainer.node()

    // Create groups for layering (edges below nodes)
    const edgeGroup = zoomContainer.append('g').attr('class', 'edges')
    const nodeGroup = zoomContainer.append('g').attr('class', 'nodes')

    // // Prepare data (clone to avoid mutation)
    // const nodes = data.nodes.map(d => ({ ...d }))
    // const edges = data.edges.map(d => ({ ...d }))

    // Prepare data (clone to avoid mutation)
    const nodes = data.nodes.map(d => ({ 
      ...d,
      x: Math.random() * width,
      y: Math.random() * height
    }))
    const edges = data.edges.map(d => ({ ...d }))

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges)
        .id(d => d.node_idx)
        .distance(30)
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(8))

    simulationRef.current = simulation

    // Draw edges
    const edgeElements = edgeGroup.selectAll('line')
      .data(edges)
      .join('line')
      .attr('class', 'edge')
      .attr('data-edge-idx', d => d.edge_idx)
      .attr('stroke', 'var(--color-border)')
      .attr('stroke-width', 1)

    // Draw nodes
    const nodeElements = nodeGroup.selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('data-node-idx', d => d.node_idx)
      .attr('r', 3)
      .attr('fill', 'var(--color-text-secondary)')
      .call(drag(simulation))

    // Add tomato border around node group area


    // Update positions on tick
    simulation.on('tick', () => {
      edgeElements
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      nodeElements
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
    })

    // Set zoom filter: allow wheel zoom, block pan when clicking on nodes
    setFilter((event) => {
      // Always allow wheel zoom
      if (event.type === 'wheel') return true
      // Block pan when starting drag on a node (let node drag handle it)
      if (event.target.classList.contains('node')) return false
      // Allow pan on empty space and edges
      return true
    })

    return () => {
      simulation.stop()
    }
  }, [data, setFilter])

  // Update highlighting based on selection state
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)

    // Update node styles
    svg.selectAll('.node')
      .attr('fill', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx)) return 'var(--color-node-selected)'
        if (hoveredNodes.has(nodeIdx)) return 'var(--color-node-hover)'
        return 'var(--color-text-secondary)'
      })
      .attr('r', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return 5
        return 3
      })
      .each(function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        // Raise selected/hovered nodes to front
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) {
          d3.select(this).raise()
        }
      })

    // Update edge styles
    svg.selectAll('.edge')
      .attr('stroke', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx)) return 'var(--color-edge-selected)'
        if (hoveredEdges.has(edgeIdx)) return 'var(--color-edge-hover)'
        return 'var(--color-border)'
      })
      .attr('stroke-width', function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx) || hoveredEdges.has(edgeIdx)) return 2
        return 1
      })
      .each(function () {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        if (selectedEdges.has(edgeIdx) || hoveredEdges.has(edgeIdx)) {
          d3.select(this).raise()
        }
      })

  }, [hoveredNodes, hoveredEdges, selectedNodes, selectedEdges])

  // Set up event handlers
  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)

    // Node events
    svg.selectAll('.node')
      .on('mouseenter', function (event) {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        hoverNode(nodeIdx)
      })
      .on('mouseleave', clearHover)
      .on('click', function (event) {
        event.stopPropagation()
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        toggleNodeSelection(nodeIdx)
      })

    // Edge events
    svg.selectAll('.edge')
      .on('mouseenter', function (event) {
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        hoverEdge(edgeIdx)
      })
      .on('mouseleave', clearHover)
      .on('click', function (event) {
        event.stopPropagation()
        const edgeIdx = +d3.select(this).attr('data-edge-idx')
        toggleEdgeSelection(edgeIdx)
      })

  }, [data, hoverNode, hoverEdge, clearHover, toggleNodeSelection, toggleEdgeSelection])

  return (
    <Pane
      title="Node-Link"
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
        aria-label="Node-Link visualization. Use +/- to zoom, drag to pan, drag nodes to reposition."
      />
    </Pane>
  )
}

// Drag behavior for nodes
function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
  }

  function dragged(event) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}

export default NodeLinkPane
