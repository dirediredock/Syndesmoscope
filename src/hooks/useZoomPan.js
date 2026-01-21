import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import * as d3 from "d3";

const DEFAULT_OPTIONS = {
  scaleExtent: [0.1, 4], // Min/max zoom
  translateExtent: null, // Optional bounds [[x0,y0], [x1,y1]]
  zoomStep: 0.25, // Multiplier per zoom in/out click
  transitionDuration: 200, // Animation duration in ms
};

/**
 * useZoomPan - Custom hook for D3 zoom/pan behavior
 *
 * @param {React.RefObject} svgRef - Reference to the SVG element
 * @param {Object} options - Configuration options
 * @returns {Object} Zoom controls and state
 */
export function useZoomPan(svgRef, options = {}) {
  const config = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [
      options.scaleExtent?.[0],
      options.scaleExtent?.[1],
      options.translateExtent,
      options.zoomStep,
      options.transitionDuration,
    ]
  );

  const [transform, setTransform] = useState(d3.zoomIdentity);
  const zoomBehaviorRef = useRef(null);
  const filterFnRef = useRef(null);

  // Initialize zoom behavior
  useEffect(() => {
    const zoom = d3
      .zoom()
      .scaleExtent(config.scaleExtent)
      .on("zoom", (event) => {
        setTransform(event.transform);
      });

    if (config.translateExtent) {
      zoom.translateExtent(config.translateExtent);
    }

    // Apply filter if one was set
    if (filterFnRef.current) {
      zoom.filter(filterFnRef.current);
    }

    zoomBehaviorRef.current = zoom;
  }, [config.scaleExtent, config.translateExtent]);

  // Apply zoom behavior to SVG
  useEffect(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.call(zoomBehaviorRef.current);

    return () => {
      svg.on(".zoom", null); // Cleanup
    };
  }, [svgRef.current, zoomBehaviorRef.current]);

  // Set a filter function for the zoom behavior
  const setFilter = useCallback((filterFn) => {
    filterFnRef.current = filterFn;
    if (zoomBehaviorRef.current) {
      zoomBehaviorRef.current.filter(filterFn);
    }
  }, []);

  // Zoom in by step
  const zoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(config.transitionDuration)
      .call(zoomBehaviorRef.current.scaleBy, 1 + config.zoomStep);
  }, [config.transitionDuration, config.zoomStep]);

  // Zoom out by step
  const zoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(config.transitionDuration)
      .call(zoomBehaviorRef.current.scaleBy, 1 / (1 + config.zoomStep));
  }, [config.transitionDuration, config.zoomStep]);

  // Reset zoom to identity (100%)
  const resetZoom = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(config.transitionDuration)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity);
  }, [config.transitionDuration]);

  // Fit content to viewport
  const fitToContent = useCallback(
    (bounds, padding = 0) => {
      if (!svgRef.current || !zoomBehaviorRef.current || !bounds) return;

      const svg = d3.select(svgRef.current);
      const svgNode = svgRef.current;
      const { width, height } = svgNode.getBoundingClientRect();

      if (
        width === 0 ||
        height === 0 ||
        bounds.width === 0 ||
        bounds.height === 0
      )
        return;

      // Calculate scale to fit bounds with padding
      const scale = Math.min(
        (width - padding * 2) / bounds.width,
        (height - padding * 2) / bounds.height,
        config.scaleExtent[1] // Don't exceed max zoom
      );

      // Center the content
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      const translateX = width / 2 - scale * centerX;
      const translateY = height / 2 - scale * centerY;

      const newTransform = d3.zoomIdentity
        .translate(translateX, translateY)
        .scale(scale);

      svg
        .transition()
        .duration(config.transitionDuration)
        .call(zoomBehaviorRef.current.transform, newTransform);
    },
    [config.transitionDuration, config.scaleExtent]
  );

  // Programmatically set transform (useful for resetting on data change)
  const setZoomTransform = useCallback((newTransform) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.call(zoomBehaviorRef.current.transform, newTransform);
  }, []);

  return {
    transform,
    zoomBehavior: zoomBehaviorRef.current,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContent,
    setFilter,
    setZoomTransform,
    zoomPercent: Math.round(transform.k * 100),
  };
}

export default useZoomPan;
