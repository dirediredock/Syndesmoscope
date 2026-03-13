import { useRef, useEffect, useCallback, useState } from "react";
import * as d3 from "d3";
import Pane from "../ui/Pane";
import { useSelection } from "../../contexts/SelectionContext";
import { useZoomPan } from "../../hooks/useZoomPan";
import "./NodeLinkPane.css";

const MIN_RENDER_WIDTH = 30;

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

const ACCENT_COLOR = "var(--color-accent-nodelink)";

// Radius steps by ~1.7× per level so visual area (πr²) steps by ~3× per level
const NODE_SIZES = {
  XS: { default: 1, highlighted: 1.8 },
  S: { default: 1.8, highlighted: 3 },
  M: { default: 3, highlighted: 5 },
  L: { default: 5, highlighted: 7.5 },
  XL: { default: 8.5, highlighted: 12 },
  XXL: { default: 15, highlighted: 20 },
};

// Stroke-width perceived linearly, so 2× geometric steps
const EDGE_SIZES = {
  XS: { default: 0.25, highlighted: 0.5 },
  S: { default: 0.5, highlighted: 1 },
  M: { default: 1, highlighted: 2 },
  L: { default: 2, highlighted: 3.5 },
  XL: { default: 5, highlighted: 8 },
  XXL: { default: 13, highlighted: 20 },
};

function NodeLinkPane({ data, networkName }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const zoomContainerRef = useRef(null);
  const simulationRef = useRef(null);
  const brushGroupRef = useRef(null);
  const brushModeRef = useRef(false);

  const {
    hoveredNodes,
    hoveredEdges,
    selectedNodes,
    selectedEdges,
    hoverNode,
    hoverEdge,
    clearHover,
    toggleNodeSelection,
    toggleEdgeSelection,
    selectNodes,
    brushMode,
  } = useSelection();

  const [nodeSize, setNodeSize] = useState("M");
  const [edgeSize, setEdgeSize] = useState("L");

  const { transform, resetZoom, fitToContent, setFilter, zoomPercent } =
    useZoomPan(svgRef, { scaleExtent: [0.01, 15] });

  // Apply zoom transform to the zoom container
  useEffect(() => {
    if (zoomContainerRef.current) {
      d3.select(zoomContainerRef.current).attr("transform", transform);
    }
  }, [transform]);

  // Keep brushModeRef in sync for resize observer access
  useEffect(() => {
    brushModeRef.current = brushMode;
  }, [brushMode]);

  // Update zoom filter based on brush mode
  useEffect(() => {
    setFilter((event) => {
      if (event.type === "wheel") return true;
      if (brushMode) return false;
      if (event.target.classList.contains("node")) return false;
      return true;
    });
  }, [setFilter, brushMode]);

  // Freeze/unfreeze simulation when brush toggles
  useEffect(() => {
    const simulation = simulationRef.current;
    if (!simulation) return;
    if (brushMode) {
      simulation.stop();
    } else {
      simulation.alpha(0.3).restart();
    }
  }, [brushMode]);

  // Toggle brush overlay pointer-events
  useEffect(() => {
    if (!brushGroupRef.current) return;
    const bg = d3.select(brushGroupRef.current);
    if (brushMode) {
      bg.style("pointer-events", "all");
      bg.select(".overlay")
        .style("pointer-events", "all")
        .style("cursor", "crosshair");
    } else {
      bg.style("pointer-events", "none");
      bg.select(".overlay")
        .style("pointer-events", "none")
        .style("cursor", "default");
    }
  }, [brushMode]);

  // Reset zoom and sizes when data changes
  useEffect(() => {
    resetZoom();
  }, [data, resetZoom]);

  // Calculate bounds for fit-to-content based on node positions
  const handleFitContent = useCallback(() => {
    const simulation = simulationRef.current;
    if (!simulation) return;

    const nodes = simulation.nodes();
    if (!nodes || nodes.length === 0) return;

    const padding = 20;
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);

    const bounds = {
      x: d3.min(xs) - padding,
      y: d3.min(ys) - padding,
      width: d3.max(xs) - d3.min(xs) + padding * 2,
      height: d3.max(ys) - d3.min(ys) + padding * 2,
    };

    fitToContent(bounds);
  }, [fitToContent]);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || !simulationRef.current)
      return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    const simulation = simulationRef.current;

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      if (width >= MIN_RENDER_WIDTH && height > 0) {
        svg.attr("width", width).attr("height", height);
        svg.attr("viewBox", `0 0 ${width} ${height}`);

        simulation.force("center", d3.forceCenter(width / 2, height / 2));
        simulation.alpha(0.3).restart();
        if (brushModeRef.current) simulation.stop();
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Initialize D3 visualization
  useEffect(() => {
    if (!containerRef.current || !data) return;

    const container = containerRef.current;
    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    // Clear previous
    d3.select(container).selectAll("*").remove();

    // Create SVG
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "100%");

    svgRef.current = svg.node();

    // Create zoom container (all content goes here)
    const zoomContainer = svg.append("g").attr("class", "zoom-container");
    zoomContainerRef.current = zoomContainer.node();

    // Create groups for layering (edges below nodes)
    const edgeGroup = zoomContainer.append("g").attr("class", "edges");
    const nodeGroup = zoomContainer.append("g").attr("class", "nodes");

    // // Prepare data (clone to avoid mutation)
    // const nodes = data.nodes.map(d => ({ ...d }))
    // const edges = data.edges.map(d => ({ ...d }))

    // Prepare data (clone to avoid mutation)
    const nodes = data.nodes.map((d) => ({
      ...d,
      x: Math.random() * width,
      y: Math.random() * height,
    }));
    const edges = data.edges.map((d) => ({ ...d }));

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(edges)
          .id((d) => d.node_idx)
          .distance(30),
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(8));

    simulationRef.current = simulation;

    // Draw edges
    const edgeElements = edgeGroup
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("class", "edge")
      .attr("data-edge-idx", (d) => d.edge_idx)
      .attr("stroke", "var(--color-edge-default-line)")
      .attr("stroke-width", 1);

    // Draw nodes
    const nodeElements = nodeGroup
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("class", "node")
      .attr("data-node-idx", (d) => d.node_idx)
      .attr("r", 3)
      .attr("fill", "var(--color-node-default)")
      .call(drag(simulation));

    // Add tomato border around node group area

    // Update positions on tick
    simulation.on("tick", () => {
      edgeElements
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      nodeElements.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
    });

    // Brush overlay (on top of zoom container so it intercepts events)
    const brushGroup = svg.append("g").attr("class", "nodelink-brush-group");
    brushGroupRef.current = brushGroup.node();

    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [width, height],
      ])
      .on("end", (event) => {
        if (!event.selection) return;
        const [[bx0, by0], [bx1, by1]] = event.selection;

        const matched = [];
        const svgNode = svg.node();
        svg.selectAll(".node").each(function () {
          const circle = this;
          const ctm = circle.getCTM();
          const svgPt = svgNode.createSVGPoint();
          svgPt.x = +circle.getAttribute("cx");
          svgPt.y = +circle.getAttribute("cy");
          const screen = svgPt.matrixTransform(ctm);
          if (
            screen.x >= bx0 &&
            screen.x <= bx1 &&
            screen.y >= by0 &&
            screen.y <= by1
          ) {
            matched.push(+d3.select(this).attr("data-node-idx"));
          }
        });

        brushGroup.call(brush.move, null);
        if (matched.length > 0) selectNodes(matched);
      });

    brushGroup.call(brush);
    brushGroup.style("pointer-events", "none");
    brushGroup
      .select(".overlay")
      .style("pointer-events", "none")
      .style("cursor", "default");

    return () => {
      simulation.stop();
    };
  }, [data, selectNodes]);

  // Update highlighting based on selection state and size settings
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const nodeSizes = NODE_SIZES[nodeSize];
    const edgeSizes = EDGE_SIZES[edgeSize];

    // Update node styles
    svg
      .selectAll(".node")
      .attr("fill", function () {
        const nodeIdx = +d3.select(this).attr("data-node-idx");
        if (selectedNodes.has(nodeIdx)) return "var(--color-node-selected)";
        if (hoveredNodes.has(nodeIdx)) return "var(--color-node-hover)";
        return "var(--color-node-default)";
      })
      .attr("r", function () {
        const nodeIdx = +d3.select(this).attr("data-node-idx");
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx))
          return nodeSizes.highlighted;
        return nodeSizes.default;
      })
      .each(function () {
        const nodeIdx = +d3.select(this).attr("data-node-idx");
        // Raise selected/hovered nodes to front
        if (selectedNodes.has(nodeIdx) || hoveredNodes.has(nodeIdx)) {
          d3.select(this).raise();
        }
      });

    // Update edge styles
    svg
      .selectAll(".edge")
      .attr("stroke", function () {
        const edgeIdx = +d3.select(this).attr("data-edge-idx");
        if (selectedEdges.has(edgeIdx)) return "var(--color-edge-selected)";
        if (hoveredEdges.has(edgeIdx)) return "var(--color-edge-hover)";
        return "var(--color-edge-default-line)";
      })
      .attr("stroke-width", function () {
        const edgeIdx = +d3.select(this).attr("data-edge-idx");
        if (selectedEdges.has(edgeIdx) || hoveredEdges.has(edgeIdx))
          return edgeSizes.highlighted;
        return edgeSizes.default;
      })
      .each(function () {
        const edgeIdx = +d3.select(this).attr("data-edge-idx");
        if (selectedEdges.has(edgeIdx) || hoveredEdges.has(edgeIdx)) {
          d3.select(this).raise();
        }
      });
  }, [
    hoveredNodes,
    hoveredEdges,
    selectedNodes,
    selectedEdges,
    nodeSize,
    edgeSize,
  ]);

  // Set up event handlers
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    // Node events
    svg
      .selectAll(".node")
      .on("mouseenter", function (event) {
        const nodeIdx = +d3.select(this).attr("data-node-idx");
        hoverNode(nodeIdx);
      })
      .on("mouseleave", clearHover)
      .on("click", function (event) {
        event.stopPropagation();
        const nodeIdx = +d3.select(this).attr("data-node-idx");
        toggleNodeSelection(nodeIdx);
      });

    // Edge events
    svg
      .selectAll(".edge")
      .on("mouseenter", function (event) {
        const edgeIdx = +d3.select(this).attr("data-edge-idx");
        hoverEdge(edgeIdx);
      })
      .on("mouseleave", clearHover)
      .on("click", function (event) {
        event.stopPropagation();
        const edgeIdx = +d3.select(this).attr("data-edge-idx");
        toggleEdgeSelection(edgeIdx);
      });
  }, [
    data,
    hoverNode,
    hoverEdge,
    clearHover,
    toggleNodeSelection,
    toggleEdgeSelection,
  ]);

  return (
    <Pane
      title="Node-Link"
      accentColor={ACCENT_COLOR}
      isEmpty={!data}
      zoomControls={{
        onReset: resetZoom,
        onFitContent: handleFitContent,
        zoomPercent,
      }}
      sizeControls={{
        nodeSize,
        nodeSizeLabel: "Node Point Size",
        onNodeSizeChange: setNodeSize,
        edgeSize,
        edgeSizeLabel: "Edge Line Size",
        onEdgeSizeChange: setEdgeSize,
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      }}
      footerControls={null}
    >
      <div ref={containerRef} className="pane-visualization" role="img" />
    </Pane>
  );
}

// Drag behavior for nodes
function drag(simulation) {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
}

export default NodeLinkPane;
