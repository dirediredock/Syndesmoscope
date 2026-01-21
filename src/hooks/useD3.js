import { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

/**
 * useD3 - Custom hook for integrating D3 visualizations with React
 *
 * This hook handles the lifecycle of D3 visualizations:
 * - Creates an SVG element on mount
 * - Calls the render function when dependencies change
 * - Handles cleanup on unmount
 *
 * @param {Function} renderFn - D3 render function, receives (svg, dimensions)
 * @param {Array} dependencies - React dependency array for re-rendering
 * @returns {Object} - { ref, dimensions }
 */

export function useD3(renderFn, dependencies = []) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const dimensionsRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create SVG if it doesn't exist
    if (!svgRef.current) {
      svgRef.current = d3
        .select(container)
        .append("svg")
        .attr("class", "visualization-svg");
    }

    const svg = svgRef.current;

    // Set up resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        dimensionsRef.current = { width, height };

        svg
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", `0 0 ${width} ${height}`);

        // Call render function with new dimensions
        if (renderFn && width > 0 && height > 0) {
          renderFn(svg, { width, height });
        }
      }
    });

    resizeObserver.observe(container);

    // Initial render
    const { width, height } = container.getBoundingClientRect();
    if (width > 0 && height > 0) {
      dimensionsRef.current = { width, height };
      svg
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`);

      if (renderFn) {
        renderFn(svg, { width, height });
      }
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, dependencies);

  return {
    ref: containerRef,
    dimensions: dimensionsRef.current,
  };
}

/**
 * useResizeObserver - Simple hook for tracking container dimensions
 *
 * @returns {Object} - { ref, width, height }
 */

export function useResizeObserver() {
  const ref = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  return { ref, ...dimensions };
}
