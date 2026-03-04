import { useRef, useEffect, useCallback, useState } from 'react'
import * as d3 from 'd3'
import Pane from '../ui/Pane'
import TranslocationControls from '../ui/TranslocationControls'
import { useSelection } from '../../contexts/SelectionContext'
import { useZoomPan } from '../../hooks/useZoomPan'
import BrushIcon from '../ui/BrushIcon'
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

// Stroke-width perceived linearly, ~2.5× geometric steps
const LINE_SIZES = {
  XS: { default: 0.15, highlighted: 0.35 },
  S:  { default: 0.4,  highlighted: 0.8  },
  M:  { default: 1,    highlighted: 2    },
  L:  { default: 2.5,  highlighted: 4.5  },
  XL: { default: 6,    highlighted: 9    }
}

function HopCensusPane({ data, networkName }) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const zoomContainerRef = useRef(null)
  const boundsRef = useRef(null)
  const brushGroupRef = useRef(null)
  const offsetMapRef = useRef(new Map())

  // Refs for efficient path updates without full SVG rebuild
  const maxCountRef = useRef(null)
  const xScaleRef = useRef(null)
  const yScaleRef = useRef(null)
  const maxHopRef = useRef(null)
  const vectorsByIdxRef = useRef(null)
  const bandIndexMapRef = useRef(null)

  const [nodeSize, setNodeSize] = useState('S')
  const [brushMode, setBrushMode] = useState(false)
  const [justify, setJustify] = useState('left')

  // Translocation offset: Map<nodeIdx, multiplier>
  const [offsetMap, setOffsetMap] = useState(() => new Map())

  // Keep ref in sync for use inside initializeVisualization (avoids dependency)
  useEffect(() => { offsetMapRef.current = offsetMap }, [offsetMap])

  const {
    hoveredNodes,
    selectedNodes,
    hoverNode,
    clearHover,
    toggleNodeSelection,
    selectNodes,
    brushResetSignal
  } = useSelection()

  const {
    transform,
    resetZoom,
    setFilter,
    zoomPercent
  } = useZoomPan(svgRef, { scaleExtent: [0.05, 15] })

  // Deactivate brush when selection is cleared from control strip
  useEffect(() => {
    if (brushResetSignal > 0) setBrushMode(false)
  }, [brushResetSignal])

  // Filter: allow wheel zoom, block drag-start on census lines (so clicks work)
  // In brush mode, block all zoom drag (wheel still works)
  useEffect(() => {
    if (!setFilter) return
    setFilter((event) => {
      if (event.type === 'wheel') return true
      if (brushMode) return false
      if (event.target && event.target.classList && event.target.classList.contains('census-line')) return false
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

  // Translocation handlers
  const handleTranslateUp = useCallback(() => {
    if (selectedNodes.size === 0) return
    setOffsetMap(prev => {
      const next = new Map(prev)
      selectedNodes.forEach(nodeIdx => {
        next.set(nodeIdx, (next.get(nodeIdx) || 0) + 1)
      })
      return next
    })
  }, [selectedNodes])

  const handleTranslateDown = useCallback(() => {
    if (selectedNodes.size === 0) return
    setOffsetMap(prev => {
      const next = new Map(prev)
      selectedNodes.forEach(nodeIdx => {
        next.set(nodeIdx, (next.get(nodeIdx) || 0) - 1)
      })
      return next
    })
  }, [selectedNodes])

  // Reset zoom to 100%, centered on content bounds
  const handleResetZoom = useCallback(() => {
    resetZoom(boundsRef.current)
  }, [resetZoom])

  // Reset state when data changes
  useEffect(() => {
    handleResetZoom()
    setOffsetMap(new Map())
  }, [data, handleResetZoom])

  // Build path `d` for a census vector, accounting for justification
  const buildPath = useCallback((rawVector, bandIdx, multiplier) => {
    const xScale = xScaleRef.current
    const yScale = yScaleRef.current
    const maxCount = maxCountRef.current
    const maxHop = maxHopRef.current
    if (!xScale || !yScale || maxCount == null || maxHop == null) return ''
    const shifted = rawVector.map(v => v + (bandIdx + multiplier) * maxCount)
    const xOffset = justify === 'right' ? maxHop - (rawVector.length - 1) : 0
    const line = d3.line()
      .x((d, i) => xScale(i + xOffset))
      .y(d => yScale(d))
    return line(shifted)
  }, [justify])

  // Apply translocation offsets (and justify changes) to path `d` attributes
  useEffect(() => {
    if (!svgRef.current || !vectorsByIdxRef.current || !bandIndexMapRef.current || maxCountRef.current == null) return
    const vectorsByIdx = vectorsByIdxRef.current
    const bim = bandIndexMapRef.current

    d3.select(svgRef.current)
      .selectAll('.census-line')
      .attr('d', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        const vecLen = +d3.select(this).attr('data-vector-length')
        const bandIdx = bim.get(vecLen) || 0
        const multiplier = offsetMap.get(nodeIdx) || 0
        const rawVector = vectorsByIdx.get(nodeIdx)
        if (!rawVector) return ''
        return buildPath(rawVector, bandIdx, multiplier)
      })
  }, [offsetMap, buildPath])

  // Initialize visualization
  const initializeVisualization = useCallback(() => {
    if (!containerRef.current || !data || !data.census_vectors) return

    const container = containerRef.current
    const { width, height } = container.getBoundingClientRect()
    if (width === 0 || height === 0) return

    // Clear previous
    d3.select(container).selectAll('*').remove()

    // Sort census vectors by vector_length ascending
    const sorted = [...data.census_vectors].sort((a, b) => b.vector_length - a.vector_length)
    const distinctLengths = [...new Set(sorted.map(v => v.vector_length))]
    const numBands = distinctLengths.length
    const bandIndexMap = new Map(distinctLengths.map((len, i) => [len, i]))

    // Aspect ratio scales with number of bands (each band ~1× wide)
    const contentWidth = width
    const contentHeight = contentWidth * Math.max(3, numBands)

    // 5% margins (proportional to content width)
    const margin = {
      top: contentWidth * 0.05,
      right: contentWidth * 0.05,
      bottom: contentWidth * 0.05,
      left: contentWidth * 0.05
    }
    const innerWidth = contentWidth - margin.left - margin.right
    const innerHeight = contentHeight - margin.top - margin.bottom

    // Center content vertically in viewport
    const contentCenterY = margin.top + innerHeight / 2
    const preOffsetY = height / 2 - contentCenterY

    // Store full content bounds for zoom-reset centering
    boundsRef.current = {
      x: margin.left,
      y: margin.top + preOffsetY,
      width: innerWidth,
      height: innerHeight
    }

    // Create SVG at viewport dimensions
    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('width', '100%')
      .style('height', '100%')

    svgRef.current = svg.node()

    // Calculate scales
    const maxHop = d3.max(data.census_vectors, v => v.vector.length) - 1
    const xScale = d3.scaleLinear()
      .domain([0, maxHop])
      .range([0, innerWidth])

    // Y domain spans numBands bands, each of height maxCount
    // Range is inverted so higher values render upward (SVG y=0 is top)
    const maxCount = d3.max(data.census_vectors, v => d3.max(v.vector))
    const yScale = d3.scaleLinear()
      .domain([0, numBands * maxCount])
      .range([innerHeight, 0])

    // Store refs
    maxCountRef.current = maxCount
    maxHopRef.current = maxHop
    xScaleRef.current = xScale
    yScaleRef.current = yScale
    bandIndexMapRef.current = bandIndexMap
    vectorsByIdxRef.current = new Map(data.census_vectors.map(v => [v.node_idx, v.vector]))

    const zoomContainer = svg.append('g')
      .attr('class', 'zoom-container')

    zoomContainerRef.current = zoomContainer.node()

    // Content group inside zoom container, pre-offset so middle lane is at viewport center
    const contentGroup = zoomContainer.append('g')
      .attr('class', 'content')
      .attr('transform', `translate(${margin.left},${margin.top + preOffsetY})`)

    // Draw vertical gridlines at each hop position, extending far beyond content
    // so they remain visible at any zoom/pan level
    const gridGroup = contentGroup.append('g').attr('class', 'grid-lines')
    const gridExtent = innerHeight * 100
    for (let i = 0; i <= maxHop; i++) {
      gridGroup.append('line')
        .attr('class', 'grid-line')
        .attr('x1', xScale(i))
        .attr('y1', -gridExtent)
        .attr('x2', xScale(i))
        .attr('y2', innerHeight + gridExtent)
        .attr('stroke', '#0a0a0a')
        .attr('stroke-width', 1)
    }

    // Draw polylines sorted by vector_length, each offset into its band
    const linesGroup = contentGroup.append('g').attr('class', 'census-lines')

    linesGroup.selectAll('.census-line')
      .data(sorted)
      .join('path')
      .attr('class', 'census-line')
      .attr('data-node-idx', d => d.node_idx)
      .attr('data-vector-length', d => d.vector_length)
      .attr('d', d => {
        const bandIdx = bandIndexMap.get(d.vector_length)
        const multiplier = offsetMapRef.current.get(d.node_idx) || 0
        return buildPath(d.vector, bandIdx, multiplier)
      })
      .attr('fill', 'none')
      .attr('stroke', 'var(--color-node-default)')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.5)
      .attr('stroke-linecap', 'round')
      .on('mouseenter', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        hoverNode(nodeIdx)
      })
      .on('mouseleave', function () { clearHover() })
      .on('click', function (event) {
        event.stopPropagation()
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        toggleNodeSelection(nodeIdx)
      })

    // Create brush overlay (on top of zoom container so it can intercept events)
    const brushGroup = svg.append('g').attr('class', 'brush-group')
    brushGroupRef.current = brushGroup.node()

    const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on('end', (event) => {
        if (!event.selection) return
        const [[bx0, by0], [bx1, by1]] = event.selection

        // Collect node indices of polylines intersecting the brush rect.
        // Path points are in local (content) coords — transform them to SVG viewport space
        // using the CTM of the path relative to the SVG root.
        const matched = []
        const svgNode = svg.node()
        svg.selectAll('.census-line').each(function () {
          const path = this
          const len = path.getTotalLength()
          if (len === 0) return
          const ctm = path.getCTM()
          const svgPt = svgNode.createSVGPoint()
          // Sample points along the path to test intersection
          const steps = Math.max(20, Math.ceil(len / 4))
          for (let i = 0; i <= steps; i++) {
            const local = path.getPointAtLength((i / steps) * len)
            svgPt.x = local.x
            svgPt.y = local.y
            const screen = svgPt.matrixTransform(ctm)
            if (screen.x >= bx0 && screen.x <= bx1 && screen.y >= by0 && screen.y <= by1) {
              matched.push(+d3.select(this).attr('data-node-idx'))
              return // found one point inside, no need to check more
            }
          }
        })

        // Clear the brush rectangle
        brushGroup.call(brush.move, null)

        if (matched.length > 0) {
          selectNodes(matched)
        }
      })

    brushGroup.call(brush)
    // Start disabled — will be enabled/disabled by brushMode effect
    brushGroup.style('pointer-events', 'none')
    brushGroup.select('.overlay').style('pointer-events', 'none').style('cursor', 'default')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, hoverNode, clearHover, toggleNodeSelection, selectNodes])

  // Resize observer
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

    return () => {
      resizeObserver.disconnect()
    }
  }, [data, initializeVisualization, handleResetZoom])

  // Initial render
  useEffect(() => {
    initializeVisualization()
    const centerTimeout = setTimeout(() => {
      handleResetZoom()
    }, 100)
    return () => clearTimeout(centerTimeout)
  }, [data, handleResetZoom])

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
        return 'var(--color-node-default)'
      })
      .attr('stroke-width', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return lineSizes.highlighted
        return lineSizes.default
      })
      .attr('stroke-opacity', function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) return 1
        return 0.5
      })
      .each(function () {
        const nodeIdx = +d3.select(this).attr('data-node-idx')
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) {
          d3.select(this).raise()
        }
      })

  }, [hoveredNodes, selectedNodes, nodeSize])


  return (
    <Pane
      title="Hop-Census"
      accentColor={ACCENT_COLOR}
      isEmpty={!data}
      footerControls={
        <>
          <div className="zoom-controls" role="group" aria-label="Brush">
            <button
              className={`zoom-btn${brushMode ? ' zoom-btn--active' : ' zoom-btn--off'}`}
              onClick={() => setBrushMode(b => !b)}
              aria-label="Brush"
              title="Brush"
            >
              <BrushIcon />
            </button>
          </div>
          <div className="zoom-controls" role="group" aria-label="Justify">
            <button
              className={`zoom-btn${selectedNodes.size > 0 ? ' zoom-btn--active' : ' zoom-btn--off'}`}
              onClick={() => setJustify(j => j === 'left' ? 'right' : 'left')}
              aria-label={'Polyline Justification'}
              title={'Polyline Justification'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14">
                {justify === 'left' ? (
                  <>
                    <line x1="1" y1="3" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="1" y1="7" x2="9" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="1" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <line x1="2" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="5" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>
          <TranslocationControls
            onUp={handleTranslateUp}
            onDown={handleTranslateDown}
            disabled={selectedNodes.size === 0}
          />
        </>
      }
      zoomControls={{
        onReset: handleResetZoom,
        zoomPercent
      }}
      sizeControls={{
        nodeSize,
        nodeSizeLabel: 'Node Polyline Size',
        nodeIcon: (
          <svg className="size-toggle-icon" width="14" height="14" viewBox="0 -1 10 10">
            <path d="M-1,6 C0.5,9 1,1 3,5 S4.5,9 6,4 S8,0 9,5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ),
        edgeSize: null,
        onNodeSizeChange: setNodeSize,
        onEdgeSizeChange: null
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

export default HopCensusPane
